# src/api/contact_routes.py
from flask import Blueprint, request, jsonify
import os, re, smtplib, time
from email.mime.text import MIMEText
from src.extensions import limiter
from src.schemas import ContactIn

contact_bp = Blueprint("contact_bp", __name__)

# basit IP rate-limit
_MIN_INTERVAL = 15  # saniye
_last_sent = {}

def _is_email(s: str) -> bool:
    return bool(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", s or ""))

def _clean(s: str, maxlen: int) -> str:
    s = (s or "").strip()
    s = re.sub(r"[\r\n]+", "\n", s)   # normalize newline
    s = re.sub(r"<[^>]*>", "", s)     # basit HTML temizliği
    return s[:maxlen]

@contact_bp.route("/contact-send", methods=["POST", "OPTIONS"])
@limiter.limit("1/second;500/minute")
def contact_send():
    if request.method == "OPTIONS":
        return ("", 204)  # CORS preflight
    try:
        data = ContactIn.model_validate(request.get_json(force=True) or {})
        # data.subject, data.message ... güvenli tipte

        project = _clean(data.project_name, 120)
        email   = _clean(data.email, 160)
        full    = _clean(data.full_name, 120)
        phone   = _clean(data.phone, 64)
        subject = _clean(data.subject or "Drone randevusu", 160)
        message = _clean(data.message or "", 5000)

        if not project:
            return jsonify(error="Proje adı gerekli"), 400
        if not _is_email(email):
            return jsonify(error="Geçerli bir e-posta giriniz"), 400

        # IP rate-limit (ekstra, istersen kaldırabilirsin)
        ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "unknown"
        now = time.time()
        if now - _last_sent.get(ip, 0) < _MIN_INTERVAL:
            return jsonify(error="Çok sık deneme. Lütfen biraz sonra tekrar deneyin."), 429
        _last_sent[ip] = now

        # ENV: MAIL_* isimleri (senin .env ile uyumlu)
        MAIL_SMTP_SERVER = os.getenv("MAIL_SMTP_SERVER")
        MAIL_SMTP_PORT   = int(os.getenv("MAIL_SMTP_PORT", "465"))
        MAIL_SENDER      = os.getenv("MAIL_SENDER")      # info@solaroptimizer360.com
        MAIL_PASS        = os.getenv("MAIL_PASS")
        MAIL_USE_SSL     = os.getenv("MAIL_USE_SSL", "true").lower() == "true"  # 465 için true

        if not (MAIL_SMTP_SERVER and MAIL_SENDER and MAIL_PASS):
            return jsonify(error="Mail sunucusu yapılandırılmamış"), 500

        # Gövde (etiket + mesaj)
        body = (
            "Yeni drone keşif randevusu talebi\n"
            "=================================\n\n"
            f"[Gönderen etiketi] Ad Soyad: {full or '-'} | E-posta: {email} | Telefon: {phone or '-'}\n"
            f"[Proje] {project}\n"
            "---------------------------------\n"
            "Mesaj:\n"
            f"{message}\n"
        )

        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"]   = subject
        msg["From"]      = MAIL_SENDER
        msg["To"]        = MAIL_SENDER
        msg["Reply-To"]  = MAIL_SENDER
        msg["X-User-Email"] = email
        if full:  msg["X-User-Name"]  = full
        if phone: msg["X-User-Phone"] = phone

        if MAIL_USE_SSL:
            with smtplib.SMTP_SSL(MAIL_SMTP_SERVER, MAIL_SMTP_PORT, timeout=15) as s:
                s.login(MAIL_SENDER, MAIL_PASS)
                s.sendmail(MAIL_SENDER, [MAIL_SENDER], msg.as_string())
        else:
            with smtplib.SMTP(MAIL_SMTP_SERVER, MAIL_SMTP_PORT, timeout=15) as s:
                try:
                    s.ehlo(); s.starttls(); s.ehlo()
                except Exception:
                    pass
                s.login(MAIL_SENDER, MAIL_PASS)
                s.sendmail(MAIL_SENDER, [MAIL_SENDER], msg.as_string())

        return jsonify(ok=True)
    except Exception as e:
        return jsonify(error=str(e)), 500
