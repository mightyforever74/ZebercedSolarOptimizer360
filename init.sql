-- Uzantılar (UUID ve şifreleme fonksiyonları için)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projeler tablosu
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,

    -- Genel bilgiler
    project_name TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Çatı boyutları
    roof_width FLOAT,
    roof_height FLOAT,
    orientation TEXT,
    gps TEXT,
    elevation FLOAT,
    slope FLOAT,

    -- Panel parametreleri
    panel_count INT DEFAULT 0,
    panel_width FLOAT,
    panel_height FLOAT,
    edge_margin FLOAT,
    panel_gap FLOAT,
    row_maintenance_gap FLOAT,
    rows_before_gap INT,
    panel_power_watt FLOAT,

    -- Hesaplama çıktıları
    panel_layout JSONB,
    obstacles JSONB,
    inputs_json JSONB,
    outputs_json JSONB,
    total_energy_kw FLOAT
);

-- E-posta raporları tablosu
CREATE TABLE IF NOT EXISTS public.email_reports (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
