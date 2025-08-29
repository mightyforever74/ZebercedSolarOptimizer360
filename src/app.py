# src\app.py
from flask import Flask, request, jsonify, make_response
from dotenv import load_dotenv
from flask_cors import CORS
import os, re, smtplib
import psycopg2, psycopg2.extras, jwt
import bcrypt
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from src.security.password import hash_password, check_password
from src.db import get_db
from flask_talisman import Talisman
from src.extensions import limiter  # Correct import for the Limiter instance
from redis import Redis
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

# Redis URL (docker-compose service name = redis)
redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Limiter setup (global)
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=redis_url,   # ✅ artık in-memory değil, Redis kullanılıyor
)

# ORS (Cross-Origin Resource Sharing) yapılandırması için 
# kullanılan izin verilen kaynak adreslerini (ALLOWED_ORIGINS) belirler
load_dotenv()
_allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _allowed.split(",") if o.strip()]

# Sadece ALLOWED_ORIGINS listesindeki origin’lerden /api/* isteklerine izin verilir.
app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
# Config
PORT = int(os.getenv("PORT", "5005"))
DATABASE_URL = os.getenv('DATABASE_URL')
JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRES_HOURS = 12  # kullanışlı bir süre

MAIL_MODE = os.getenv("MAIL_MODE", "prod").lower()
MAIL_SMTP_SERVER = os.getenv("MAIL_SMTP_SERVER")
MAIL_SMTP_PORT = int(os.getenv("MAIL_SMTP_PORT", "465"))
MAIL_SENDER = os.getenv("MAIL_SENDER")
MAIL_PASS = os.getenv("MAIL_PASS")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "true").lower() == "true"

COOKIE_NAME = "token"


# Rate Limiting
redis_url = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
storage = "redis://" + redis_url.split("://", 1)[1]
limiter.init_app(app)                     # ✅
limiter._storage_uri = storage   


csp = {
    'default-src': ["'self'"],
    'script-src':  ["'self'", "https://api.nepcha.com", "'unsafe-inline'"],
    'style-src':   ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
    'img-src':     ["'self'", "https://solaroptimizer360.com", "data:"],
    'connect-src': ["'self'", "https://api.solaroptimizer360.com"],
    'font-src':    ["'self'", "https://cdnjs.cloudflare.com", "data:"],
}

Talisman(
    app,
    content_security_policy=csp,
    force_https=True,
    strict_transport_security=True,
    strict_transport_security_max_age=31536000,
    frame_options='DENY',
    session_cookie_secure=True,
    session_cookie_samesite="Lax",
    referrer_policy="strict-origin-when-cross-origin",  # Referrer-Policy
    permissions_policy="geolocation=()"  # Permissions-Policy
)

from src.api.metrics_routes import metrics_bp
from src.api.contact_routes import contact_bp
from src.api.panel_routes import panel_bp

app.register_blueprint(metrics_bp, url_prefix="/api/metrics")
app.register_blueprint(contact_bp, url_prefix="/api/contact")
app.register_blueprint(panel_bp)

def _cookie_kwargs():
    return dict(
        httponly=True,
        secure=os.getenv("COOKIE_SECURE","false").lower()=="true",
        samesite=os.getenv("COOKIE_SAMESITE","Lax"),
        domain=(os.getenv("COOKIE_DOMAIN") or None),
        path="/",
        # kalıcı cookie istiyorsan gün sayısı ver; dev için session cookie bırakılabilir
        **({"max_age": int(os.getenv("COOKIE_PERSIST_DAYS","0"))*24*3600}
           if int(os.getenv("COOKIE_PERSIST_DAYS","0") or "0")>0 else {})
    )

def build_set_password_link(token: str) -> str:
    return f"{FRONTEND_URL}/auth/set-password?token={token}"

def build_reset_link(token: str) -> str:
    return f"{FRONTEND_URL}/auth/reset/basic-reset?token={token}"

def normalize_email(e: str | None) -> str:
    return (e or "").strip().lower()

# Sağlık kontrolü:endpoint’i ile API’nin çalışıp çalışmadığı kontrol edilir.
@app.route("/api/health", methods=["GET"])
def health():
    try:
        conn = get_db()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "db error", "error": str(e)}, 500

def _corsify_reset(resp):
    origin = request.headers.get("Origin")
    if origin and origin in allowed_origins:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return resp

def is_strong_password(password):
    if len(password) < 8:
        return False, "Şifre en az 8 karakter olmalı."
    if not re.search(r"[A-Z]", password):
        return False, "Şifre en az bir büyük harf içermeli."
    if not re.search(r"[a-z]", password):
        return False, "Şifre en az bir küçük harf içermeli."
    if not re.search(r"[0-9]", password):
        return False, "Şifre en az bir rakam içermeli."
    if not re.search(r"[^\w\s]", password):
        return False, "Şifre en az bir özel karakter içermeli."
    return True, ""

def _send_mail(to_email: str, subject: str, body: str):
    if MAIL_MODE == "dev_console":
        print(f"[DEV] MAIL to={to_email} subject={subject}\n{body}\n")
        return

    msg = MIMEText(body, _charset="utf-8")
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM or MAIL_SENDER
    msg["To"] = to_email

    if MAIL_USE_SSL:
        # 465 gibi SSL portları
        with smtplib.SMTP_SSL(MAIL_SMTP_SERVER, MAIL_SMTP_PORT) as server:
            if MAIL_SENDER and MAIL_PASS:
                server.login(MAIL_SENDER, MAIL_PASS)
            server.send_message(msg)
    else:
        # 587/STARTTLS veya 1025/MailHog vb.
        with smtplib.SMTP(MAIL_SMTP_SERVER, MAIL_SMTP_PORT) as server:
            try:
                server.ehlo(); server.starttls(); server.ehlo()
            except Exception:
                pass
            if MAIL_SENDER and MAIL_PASS:
                server.login(MAIL_SENDER, MAIL_PASS)
            server.send_message(msg)

@app.route('/api/auth/reset-password', methods=['OPTIONS'])
def reset_password_preflight():
    origin = request.headers.get("Origin")
    resp = make_response("", 204)  # OK, body yok
    # whitelist: ALLOWED_ORIGINS içindeki origin'lere izin ver
    if origin and origin in allowed_origins:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return resp

def send_verify_set_password_email(email: str, token: str):
    link = build_set_password_link(token)
    body = (
        "Solar Optimizer hesabınızı doğrulamak ve şifrenizi belirlemek için linke tıklayın:\n\n"
        f"{link}\n\n"
        "Bu bağlantı 12 saat geçerlidir."
    )
    _send_mail(email, "Solar Optimizer – Hesap Doğrulama ve Şifre Belirleme", body)

def send_reset_email(to_email: str, token: str):
    link = build_reset_link(token)
    body = (
        "Solar Optimizer şifre sıfırlama linkiniz:\n\n"
        f"{link}\n\n"
        "Bu link 30 dakika geçerlidir."
    )
    _send_mail(to_email, "Solar Optimizer – Şifre Sıfırlama", body)

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """
    Body:
      {
        "token": "<jwt purpose=reset>",
        "new_password": "<YeniSifre#123>"
      }
    """
    try:
        data = request.get_json(silent=True) or {}
        token = data.get('token')
        new_password = data.get('new_password')

        # 1) Giriş doğrulama
        if not token or not new_password:
            r = jsonify(error="Eksik bilgi: token ve new_password zorunludur."); r.status_code = 400
            return _corsify_reset(r)

        strong, msg = is_strong_password(new_password)
        if not strong:
            r = jsonify(error=msg); r.status_code = 400
            return _corsify_reset(r)

        # 2) Token çöz
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            r = jsonify(error="Sıfırlama linkinin süresi dolmuş."); r.status_code = 400
            return _corsify_reset(r)
        except jwt.InvalidTokenError:
            r = jsonify(error="Geçersiz veya bozuk token."); r.status_code = 400
            return _corsify_reset(r)

        # forgot-password akışında purpose="reset" bekliyoruz
        if decoded.get("purpose") != "reset":
            r = jsonify(error="Geçersiz token amacı."); r.status_code = 400
            return _corsify_reset(r)

        email = normalize_email(decoded.get('email'))
        if not email:
            r = jsonify(error="Token geçersiz: e-posta yok."); r.status_code = 400
            return _corsify_reset(r)

        # 3) Şifre hashle ve kaydet
        pw_hash = hash_password(new_password)

        conn = get_db()
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE public.users SET password_hash=%s WHERE email=%s",
                        (pw_hash, email)
                    )
                    if cur.rowcount == 0:
                        r = jsonify(error="Bu e-posta ile kayıtlı kullanıcı bulunamadı."); r.status_code = 404
                        return _corsify_reset(r)
        finally:
            try: conn.close()
            except: pass

        # 4) Başarılı
        r = jsonify(message="Şifreniz başarıyla güncellendi.")
        r.status_code = 200
        return _corsify_reset(r)

    except Exception as e:
        print("RESET PASSWORD ERROR:", str(e))
        import traceback; traceback.print_exc()
        r = jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."); r.status_code = 500
        return _corsify_reset(r)


# app.py — REGISTER (temizlenmiş ve helper'a geçirilmiş sürüm)
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json(silent=True) or {}
        email = normalize_email(data.get('email'))
        role = (data.get('role') or 'user').strip().lower()

        if not email:
            return jsonify(error='Email zorunludur.'), 400

        conn = get_db()
        try:
            conn.autocommit = False  # manual tx
            with conn.cursor() as cur:
                # 1) Email tekilliği
                cur.execute("SELECT 1 FROM public.users WHERE email=%s", (email,))
                if cur.fetchone():
                    conn.rollback()
                    return jsonify(
                        error="Bu e-posta zaten kayıtlı. Sizi kullanıcı girişine yönlendiriyorum.",
                        redirect_to="/auth/signin/basic"
                    ), 409

                # 2) Şifresiz kullanıcı oluştur (password_hash = NULL)
                cur.execute("""
                    INSERT INTO public.users (email, password_hash, role, is_verified, created_at)
                    VALUES (%s, NULL, %s, %s, NOW())
                    RETURNING id
                """, (email, role, False))
                row = cur.fetchone()            # <-- cursor kapanmadan önce
                user_id = row[0] if row else None

                # 3) Doğrulama + ilk şifre belirleme token'ı (12 saat)
                payload = {
                    "email": email,
                    "purpose": "signup_setpw",
                    "exp": datetime.utcnow() + timedelta(hours=12),
                }
                token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
                if isinstance(token, bytes):
                    token = token.decode("utf-8")

                # 4) E-posta gönder (başarısız olursa exception → rollback)
                send_verify_set_password_email(email, token)

            # 5) Her şey yolundaysa commit
            conn.commit()

        except Exception as send_or_db_err:
            try:
                conn.rollback()
            except Exception:
                pass
            # Logla ve kullanıcıya güvenli mesaj dön
            print("REGISTER ERROR:", str(send_or_db_err))
            import traceback; traceback.print_exc()
            return jsonify(error="Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin."), 500
        finally:
            try:
                conn.close()
            except Exception:
                pass

        return jsonify(
            message="Kayıt alındı. Lütfen e-postanızdaki linkten hesabınızı doğrulayıp şifrenizi belirleyin.",
            id=user_id, email=email, role=role
        ), 201

    except Exception as e:
        print("REGISTER HANDLER ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = normalize_email(data.get('email'))
        password = data.get('password') or ''

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, email, password_hash, role, is_verified
                      FROM public.users
                     WHERE email = %s
                """, (email,))
                row = cur.fetchone()
        finally:
            try: conn.close()
            except: pass

        if not row:
            return jsonify(error="Kullanıcı bulunamadı."), 404

        user_id, user_email, pw_hash, role, is_verified = row

        if not pw_hash:
            return jsonify(error="Lütfen e-postadaki linkten şifrenizi belirleyin."), 403
        if not is_verified:
            return jsonify(error="Lütfen emailinizi doğrulayın."), 403
        if not check_password(password, pw_hash):
            return jsonify(error="Geçersiz şifre."), 401

        payload = {
            "id": user_id,
            "email": user_email,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRES_HOURS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        if isinstance(token, bytes):
            token = token.decode("utf-8")

        resp = make_response(jsonify(message="ok"), 200)
        resp.set_cookie(
            "token",
            token,
            httponly=True,
            secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
            samesite=os.getenv("COOKIE_SAMESITE", "Lax"),
            domain=os.getenv("COOKIE_DOMAIN") or None,
            path="/"
        )
        return resp
    except Exception as e:
        print("LOGIN ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json(silent=True) or {}
        email = normalize_email(data.get('email'))
        if not email:
            return jsonify(error='Email zorunlu.'), 400

        # kullanıcı var mı? (güvenlik için var/yok aynı mesaj)
        conn = get_db()
        try:
            with conn:
                with conn.cursor() as cur:
                   cur.execute("SELECT 1 FROM public.users WHERE email=%s", (email,))
                   exists = cur.fetchone() is not None
        finally:
            try: conn.close()
            except: pass
        # token üret ve gönder (var ise mail gider)
        if exists:
            payload = {"email": email, "purpose": "reset", "exp": datetime.utcnow() + timedelta(minutes=30)}
            token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
            if isinstance(token, bytes): token = token.decode("utf-8")
            send_reset_email(email, token)

        return jsonify(message='Şifre sıfırlama maili gönderildi. Lütfen emailinizi kontrol edin.'), 200

    except Exception as e:
        print("FORGOT PASSWORD ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500


@app.route('/api/auth/set-password', methods=['POST'])
def set_password():
    """
    Body:
    {
      "token": "<jwt purpose=signup_setpw>",
      "new_password": "<YeniSifre#123>"
    }
    """
    try:
        data = request.get_json(silent=True) or {}
        token = data.get('token')
        new_password = data.get('new_password')

        if not token or not new_password:
            return jsonify(error="Eksik bilgi: token ve new_password zorunludur."), 400

        strong, msg = is_strong_password(new_password)
        if not strong:
            return jsonify(error=msg), 400

        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify(error="Doğrulama linkinin süresi dolmuş."), 400
        except jwt.InvalidTokenError:
            return jsonify(error="Geçersiz veya bozuk token."), 400

        email = normalize_email(decoded.get('email'))
        if not email:
            return jsonify(error="Token geçersiz: e-posta yok."), 400
        if decoded.get("purpose") != "signup_setpw":
            return jsonify(error="Geçersiz token amacı."), 400

        pw_hash = hash_password(new_password)

        conn = get_db()
        try:
            with conn:
                with conn.cursor() as cur:
                    # Yalnızca ilk kez şifre belirleme için güncelle
                    cur.execute("""
                        UPDATE public.users
                           SET password_hash = %s,
                               is_verified   = TRUE
                         WHERE email = %s
                           AND (password_hash IS NULL OR is_verified = FALSE)
                    """, (pw_hash, email))
                    if cur.rowcount == 0:
                        # Zaten şifresi var veya doğrulanmış → 409
                        return jsonify(
                            error="Hesabınız zaten etkin. Lütfen giriş yapın veya 'Şifremi Unuttum' kullanın."
                        ), 409
        finally:
            try: conn.close()
            except: pass

        return jsonify(message="Şifreniz oluşturuldu ve hesabınız doğrulandı. Giriş yapabilirsiniz."), 200

    except Exception as e:
        print("SET PASSWORD ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500


@app.route('/api/protected', methods=['GET'])
def protected():
    try:
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify(error='Missing token'), 401

        token = auth.split(' ', 1)[1]
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify(error='Token expired'), 401
        except jwt.InvalidTokenError:
            return jsonify(error='Invalid token'), 401

        return jsonify(message='Hoş geldiniz!', user=decoded)
    except Exception as e:
        print("PROTECTED ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500

@app.route('/api/auth/verify-email', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = decoded.get('email')
        if not email:
            return jsonify(error="Geçersiz token: e-posta yok."), 400

        conn = get_db()
        try:
           with conn:
               with conn.cursor() as cur:
                   cur.execute(
                       "UPDATE public.users SET is_verified = true WHERE email = %s",
                       (email,)
                   )
                   if cur.rowcount == 0:
                       return jsonify(error="Kullanıcı bulunamadı."), 404
        finally:
            try: conn.close()
            except: pass

        return jsonify(message="Email doğrulandı. Giriş yapabilirsiniz.", email=email), 200

    except jwt.ExpiredSignatureError:
        return jsonify(error="Doğrulama linkinin süresi dolmuş."), 400
    except jwt.InvalidTokenError:
        return jsonify(error="Geçersiz veya bozuk token."), 400
    except Exception as e:
        print("VERIFY EMAIL ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500

# ---- METRICS ----
@app.route("/api/metrics/today-users", methods=["GET"])
def metrics_today_users():
    conn = get_db()  # mevcut helper
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT COUNT(*) 
                  FROM public.users 
                 WHERE DATE(created_at) = CURRENT_DATE
            """)
            cnt = cur.fetchone()[0]
        return jsonify(count=cnt), 200
    finally:
        try: conn.close()
        except: pass

@app.route("/api/metrics/total-users", methods=["GET"])
def metrics_total_users():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM public.users")
            cnt = cur.fetchone()[0]
        return jsonify(count=cnt), 200
    finally:
        try: conn.close()
        except: pass

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify(message="ok"), 200)
    resp.set_cookie(
        "token", "", expires=0, max_age=0, path="/",
        domain=os.getenv("COOKIE_DOMAIN") or None,
        samesite=os.getenv("COOKIE_SAMESITE", "Lax"),
        secure=os.getenv("COOKIE_SECURE","false").lower()=="true",
        httponly=True,
    )
    return resp

@app.route("/api/projects/start", methods=["POST"]) # kullanıcıya proje başlatır.
def start_project():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    project_name = (data.get("project_name") or "").strip()

    if not email or not password or not project_name:
        return jsonify(error="email, password, project_name zorunludur"), 400

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # 1) user var mı?
            cur.execute("SELECT id, password_hash FROM public.users WHERE email=%s", (email,))
            row = cur.fetchone()
            if row:
                user_id = row["id"]
                pwd_hash = row["password_hash"]
                # mevcut kullanıcı: parola doğrula
                try:
                    ok = bcrypt.checkpw(password.encode("utf-8"), pwd_hash.encode("utf-8"))
                except Exception:
                    ok = False
                if not ok:
                    return jsonify(error="Parola doğrulanamadı"), 401
            else:
                # yeni kullanıcı oluştur
                pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
                cur.execute("""
                    INSERT INTO public.users (email, password_hash, is_verified, is_admin, role, created_at)
                    VALUES (%s, %s, FALSE, FALSE, 'user', NOW())
                    RETURNING id
                """, (email, pw_hash))
                user_id = cur.fetchone()[0]

        conn.commit()
        # projects'e yazmıyoruz; hesap tamamlanınca /api/projects/commit ile yazacağız
        return jsonify(user_id=user_id), 200
    except Exception as e:
        conn.rollback()
        return jsonify(error=str(e)), 500
    finally:
        try: conn.close()
        except: pass


# --- REPORT helpers (PDF + Email) ---
import os, smtplib, uuid, tempfile
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
MAIL_FROM = os.getenv("MAIL_FROM", SMTP_USER)
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")

def _ensure_reporting_tables():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS public.email_reports (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                    sent_to TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            """)
        conn.commit()
    finally:
        try: conn.close()
        except: pass

# Uygulama ayağa kalkarken bir kere çağır (create_app / main kısmında):
_ensure_reporting_tables()

def generate_user_report_pdf(user_email: str, rows: list, limit: int = 3) -> str:
    """
    rows: [(project_name, roof_width, roof_height, orientation, panel_count, calculated_kw, created_at), ...]
    geri dönüş: oluşturulan PDF'in tam dosya yolu
    """
    fd, tmp_path = tempfile.mkstemp(prefix=f"so360_{uuid.uuid4().hex}_", suffix=".pdf")
    os.close(fd)
    c = canvas.Canvas(tmp_path, pagesize=A4)
    w, h = A4

    # Başlık
    c.setFont("Helvetica-Bold", 16)
    c.drawString(2*cm, h - 2*cm, "SolarOptimizer360 – Hesaplama Özeti")
    c.setFont("Helvetica", 10)
    c.drawString(2*cm, h - 2.6*cm, f"Müşteri: {user_email}")
    c.drawString(2*cm, h - 3.1*cm, f"Toplam gösterilen sonuç: {min(limit, len(rows))}")

    # Tablo başlıkları
    y = h - 4.2*cm
    c.setFont("Helvetica-Bold", 10)
    headers = ["Proje", "Genişlik(m)", "Yükseklik(m)", "Yön", "Panel", "kW", "Tarih"]
    x_positions = [2*cm, 7.5*cm, 9.7*cm, 12*cm, 14*cm, 16*cm, 18*cm]
    for x, head in zip(x_positions, headers):
        c.drawString(x, y, head)
    c.line(2*cm, y-0.2*cm, 19.2*cm, y-0.2*cm)
    y -= 0.7*cm

    # Satırlar
    c.setFont("Helvetica", 9)
    for (pname, rw, rh, ori, pcount, kw, created_at) in rows[:limit]:
        values = [
            str(pname)[:28],
            f"{rw:.2f}",
            f"{rh:.2f}",
            str(ori)[:10],
            str(pcount),
            f"{float(kw):.2f}",
            created_at.strftime("%Y-%m-%d %H:%M"),
        ]
        for x, val in zip(x_positions, values):
            c.drawString(x, y, val)
        y -= 0.55*cm
        if y < 2.5*cm:
            c.showPage()
            y = h - 4.2*cm

    c.save()
    return tmp_path

def send_email_with_attachment(to_email: str, subject: str, body: str, file_path: str):
    if MAIL_MODE == "dev_console":
        print(f"[DEV] MAIL to={to_email} subject={subject}\n{body}\nAttachment: {file_path}\n")
        return

    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = MAIL_FROM or MAIL_SENDER
    msg["To"] = to_email

    # Metin gövdesi
    msg.attach(MIMEText(body, _charset="utf-8"))

    # Dosya eki
    with open(file_path, "rb") as f:
        part = MIMEApplication(f.read(), _subtype="pdf")
        part.add_header(
            "Content-Disposition",
            f"attachment; filename={os.path.basename(file_path)}",
        )
        msg.attach(part)

    if MAIL_USE_SSL:
        # 465 gibi SSL portları
        with smtplib.SMTP_SSL(MAIL_SMTP_SERVER, MAIL_SMTP_PORT) as server:
            if MAIL_SENDER and MAIL_PASS:
                server.login(MAIL_SENDER, MAIL_PASS)
            server.send_message(msg)
    else:
        # 587/STARTTLS veya 1025/MailHog vb.
        with smtplib.SMTP(MAIL_SMTP_SERVER, MAIL_SMTP_PORT) as server:
            try:
                server.ehlo(); server.starttls(); server.ehlo()
            except Exception:
                pass
            if MAIL_SENDER and MAIL_PASS:
                server.login(MAIL_SENDER, MAIL_PASS)
            server.send_message(msg)

@app.route("/api/admin/users/<int:user_id>/send-latest-report", methods=["POST"])
def admin_send_latest_report(user_id: int):
    # Basit admin koruması
    admin_key = request.headers.get("X-ADMIN-KEY")
    if not ADMIN_API_KEY or admin_key != ADMIN_API_KEY:
        return jsonify(error="unauthorized"), 403

    payload = request.get_json(force=True) or {}
    limit = int(payload.get("limit", 3))
    override_email = (payload.get("email") or "").strip().lower()

    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Kullanıcı çek
            cur.execute("SELECT email FROM public.users WHERE id=%s", (user_id,))
            row = cur.fetchone()
            if not row:
                return jsonify(error="user not found"), 404
            user_email = override_email or row[0]

            # Son N hesaplama (bizde her hesap projects tablosuna bir satır)
            cur.execute("""
                SELECT project_name, roof_width, roof_height, orientation, panel_count, calculated_kw, created_at
                  FROM public.projects
                 WHERE user_id=%s
              ORDER BY created_at DESC NULLS LAST
                 LIMIT %s
            """, (user_id, limit))
            rows = cur.fetchall()
            if not rows:
                return jsonify(error="no projects found for user"), 404

        # PDF üret
        pdf_path = generate_user_report_pdf(user_email, rows, limit=limit)

        # E-posta gönder
        subject = "SolarOptimizer360 – Hesaplama Özeti"
        body = f"Merhaba,\n\nSon {len(rows[:limit])} hesaplamanızın özetini ekte bulabilirsiniz.\n\nSevgiler,\nSolarOptimizer360"
        send_email_with_attachment(user_email, subject, body, pdf_path)

        return jsonify(message="Report sent"), 200

    except Exception as e:
        print("ADMIN SEND REPORT ERROR:", str(e))
        import traceback; traceback.print_exc()
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500

@app.route('/api/auth/me', methods=['GET'])
def me():
    try:
        token = request.cookies.get("token")
        if not token:
            return jsonify(error="Unauthorized"), 401
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify(error="Expired"), 401
        except jwt.InvalidTokenError:
            return jsonify(error="Invalid"), 401

        user = {"email": decoded.get("email"), "role": decoded.get("role")}
        return jsonify(user=user), 200
    except Exception as e:
        print("ME ERROR:", str(e))
        return jsonify(error="Sunucu hatası. Lütfen tekrar deneyin."), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
