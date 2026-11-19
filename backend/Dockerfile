# Backend image: Django + Channels on Daphne. Also used by the scheduler service.
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 1000 app

WORKDIR /app
COPY requirements/ requirements/
RUN pip install -r requirements/prod.txt

COPY --chown=app:app . .
RUN chmod +x docker-entrypoint.sh && mkdir -p /app/media /app/staticfiles && chown app:app /app/media /app/staticfiles

USER app
EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["daphne", "--bind", "0.0.0.0", "--port", "8000", "--proxy-headers", "config.asgi:application"]
