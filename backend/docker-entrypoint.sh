#!/bin/sh
# Web container: apply migrations and collect static files before serving.
# The scheduler container sets SKIP_MIGRATE=1 so only one service migrates.
set -e

if [ "${SKIP_MIGRATE:-0}" != "1" ]; then
  python manage.py migrate --noinput
  python manage.py collectstatic --noinput --verbosity 0
fi

exec "$@"
