# Temel Python imajı
FROM python:3.10-slim

# Ortam ayarları
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Çalışma dizini
WORKDIR /app

# Sisteme bağımlı paketler (psycopg2 için)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Gereksinimler
COPY requirements.txt .

# ✅ pip'i güncelle ve bağımlılıkları kur
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Proje dosyaları
COPY src ./src     
# <- sadece backend/src kopyalanır

# Bekleme scriptini kopyala
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# Port
EXPOSE 8000

# Gunicorn ile çalıştır
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "src.app:app"]
