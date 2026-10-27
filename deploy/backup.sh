#!/bin/sh
# Nightly backups of the database and uploaded files.
#   backup.sh now    take one backup immediately
#   backup.sh loop   (container default) back up daily at BACKUP_HOUR, keep BACKUP_KEEP_DAYS days
set -eu

backup() {
  stamp=$(date -u +%Y%m%d-%H%M%S)
  pg_dump --format=custom --no-owner --file="/backups/db-$stamp.dump.partial"
  mv "/backups/db-$stamp.dump.partial" "/backups/db-$stamp.dump"
  tar -czf "/backups/media-$stamp.tar.gz.partial" -C /media .
  mv "/backups/media-$stamp.tar.gz.partial" "/backups/media-$stamp.tar.gz"
  find /backups -name 'db-*.dump' -mtime +"$BACKUP_KEEP_DAYS" -delete
  find /backups -name 'media-*.tar.gz' -mtime +"$BACKUP_KEEP_DAYS" -delete
  echo "backup $stamp done: $(du -h "/backups/db-$stamp.dump" | cut -f1) database, $(du -h "/backups/media-$stamp.tar.gz" | cut -f1) files"
}

case "${1:-now}" in
  now) backup ;;
  loop)
    last=""
    while true; do
      today=$(date -u +%Y-%m-%d)
      if [ "$(date -u +%H)" -ge "$BACKUP_HOUR" ] && [ "$last" != "$today" ]; then
        backup || echo "backup FAILED" >&2
        last=$today
      fi
      sleep 300
    done ;;
  *) echo "usage: backup.sh now|loop" >&2; exit 2 ;;
esac
