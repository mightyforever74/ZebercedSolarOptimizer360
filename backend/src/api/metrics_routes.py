# src/api/metrics_routes.py
from flask import Blueprint, jsonify
from src.db import get_db  # ✅ merkezi DB fonksiyonunu kullanalım

metrics_bp = Blueprint("metrics", __name__)  # isim sade

@metrics_bp.route("/today-users", methods=["GET"])
def today_users():
    """
    Bugün kayıt olan kullanıcı sayısı
    """
    conn = get_db()
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
        try:
            conn.close()
        except:
            pass

@metrics_bp.route("/total-users", methods=["GET"])
def total_users():
    """
    Toplam kayıtlı kullanıcı sayısı
    """
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM public.users")
            cnt = cur.fetchone()[0]
        return jsonify(count=cnt), 200
    finally:
        try:
            conn.close()
        except:
            pass
