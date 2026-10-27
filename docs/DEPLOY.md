# Deploying to production

The system runs on one Linux server with Docker Compose. Everything lives in `deploy/`.

| Service | What it does |
|---|---|
| `web` | Caddy. Serves the built frontend, gets and renews the HTTPS certificate, and forwards `/api`, `/ws`, `/admin`, `/health/` and `/ready/` to the backend |
| `backend` | Django on Daphne (HTTP and WebSockets). Applies migrations and collects static files each time it starts |
| `scheduler` | Background jobs. Every minute it publishes scheduled notices and sends queued emails. Each night it marks overdue invoices and adds late fees, removes orphaned uploads and clears expired sign-in tokens |
| `db` | PostgreSQL 16 |
| `redis` | Cache (shared login throttling), and live messaging between processes |
| `backup` | Nightly database dump and uploaded-files archive, kept for 14 days |

Uploaded files are private. They are stored in the `media` volume and served only through the permission-checked API, never directly by the web server.

## 1. Prepare the server

- Use Ubuntu 22.04 or 24.04 with at least 2 vCPU, 4 GB RAM and 40 GB disk.
- Point the domain's DNS **A record** at the server's public IP.
- Allow ports 80 and 443 in the firewall. Allow SSH only from trusted IPs if you can.

```sh
# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out and back in

sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
```

## 2. First deploy

```sh
git clone <repo-url> school && cd school/deploy
cp .env.example .env
nano .env        # fill in every value; generate the secrets with the commands shown in the file
docker compose up -d --build
docker compose ps                # every service should become "healthy" or "running"
curl -fsS https://<your-domain>/ready/   # {"status": "ok", "database": "ok", "cache": "ok"}
```

Create the customer's organization, school and first Principal login. This adds no demo data:

```sh
docker compose exec backend python manage.py bootstrap_school \
  --org "Sunrise Education" --slug sunrise \
  --school "Sunrise Academy" --code SA \
  --admin-email principal@sunrise.edu --admin-name "Asha Rai"
```

The command prints a one-time password. The Principal must replace it at their first sign-in. After that, set up the school in this order:

1. Settings → School Profile (name, logo, address; used on every printed document)
2. Academic year (set it as current)
3. Classes and sections
4. Subjects
5. Bell schedule and class routine
6. Teachers
7. Students and guardians
8. Fee structures

**Never run `seed_demo`, `seed_rich`, `seed_exams` or `seed_finance` in production.** They create demo accounts with a published password.

### Email

Set `EMAIL_URL`, for example `smtp+tls://user:password@smtp.example.com:587`, and `DEFAULT_FROM_EMAIL`. Then restart: `docker compose up -d`.

Email is used for:

- password resets
- notification emails, when the school turns on the email channel in Settings → Notifications
- notices that have "send email" ticked

If `EMAIL_URL` is empty, emails are written to the backend log instead of being sent.

To test the mail setup:

```sh
docker compose exec backend python manage.py sendtestemail you@example.com
```

## 3. Updating

```sh
cd school && git pull
cd deploy && docker compose up -d --build
docker compose logs -f backend   # migrations run automatically on start
```

Take a backup first if the update includes database migrations:

```sh
docker compose exec backup /bin/sh /backup.sh now
```

## 4. Rolling back

1. Check out the previous release: `git checkout <previous-tag-or-commit>`.
2. Run `docker compose up -d --build`.
3. If the bad release changed the database, restore the backup taken before the update (see below).

## 5. Backups and restore

Backups are written to `BACKUP_DIR` (default `deploy/backups/`) at `BACKUP_HOUR` (UTC). Each backup has two files:

- `db-<stamp>.dump`: a PostgreSQL custom-format dump
- `media-<stamp>.tar.gz`: the uploaded files

**Copy them off the server.** For example, sync the folder to object storage with `rclone` from a nightly cron job, or mount a network disk as `BACKUP_DIR`. A backup kept only on the same disk does not protect against losing the server.

Restore. Test this procedure on a spare server at least once before go-live:

```sh
cd deploy
docker compose stop backend scheduler web
# database
docker compose exec -T db dropdb -U "$POSTGRES_USER" "$POSTGRES_DB"
docker compose exec -T db createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
docker compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner < backups/db-<stamp>.dump
# uploaded files
docker compose run --rm -v "$PWD/backups:/backups" --entrypoint sh backend \
  -c 'rm -rf /app/media/* && tar -xzf /backups/media-<stamp>.tar.gz -C /app/media'
docker compose up -d
```

(Load `deploy/.env` into your shell first with `set -a; . ./.env; set +a` so `$POSTGRES_USER` and `$POSTGRES_DB` are set.)

## 6. Operations

| Task | Command (from `deploy/`) |
|---|---|
| Service status | `docker compose ps` |
| Logs (JSON lines) | `docker compose logs -f backend scheduler web` |
| Django shell | `docker compose exec backend python manage.py shell` |
| Retry failed emails | `docker compose exec backend python manage.py send_notification_emails --retry-failed` |
| Run all jobs once now | `docker compose exec scheduler python manage.py run_scheduler --once` |
| Platform admin account | `docker compose exec backend python manage.py createsuperuser` |

Health endpoints:

- `/health/`: the process is up.
- `/ready/`: the database and cache answer. The backend's container health check uses it.

To get error reports, set `SENTRY_DSN` to report errors to Sentry.

## 7. Security checklist before go-live

- [ ] `.env` has a fresh `DJANGO_SECRET_KEY` and `POSTGRES_PASSWORD`, and the file is not committed.
- [ ] `docker compose exec backend python manage.py check --deploy` reports no issues.
- [ ] HTTPS works and `http://` redirects to `https://`.
- [ ] No demo accounts exist (`*@demo.school`, `admin@platform.test`).
- [ ] Backups are copied off the server, and a restore has been tested.
- [ ] Email works (`sendtestemail`).
- [ ] The server gets security updates (`sudo apt install unattended-upgrades`).
