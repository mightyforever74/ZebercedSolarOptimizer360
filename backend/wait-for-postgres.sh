#!/bin/sh
set -e

echo "⏳ Postgres hazır olana kadar bekleniyor..."

until pg_isready -h postgres -U postgres -d solar360; do
  >&2 echo "Postgres çalışmıyor, tekrar denenecek..."
  sleep 2
done

echo "✅ Postgres hazır - API başlatılıyor."
exec "$@"