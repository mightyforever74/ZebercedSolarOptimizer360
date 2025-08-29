# api\panel\projects\draft\start.py
import json
from src.db import get_db
from psycopg2.extras import RealDictCursor, Json

def api_draft_start(user_id: int, project_name: str, inputs: dict):
    """
    Yeni bir draft proje başlatır.
    user_id: integer (zorunlu)
    project_name: boş olmayan string (zorunlu)
    inputs: dict (çatı boyutları, panel parametreleri vs.)
    """
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Geçersiz user_id")
    if not project_name or not isinstance(project_name, str):
        raise ValueError("Geçersiz project_name")

    sql = """
      INSERT INTO projects (id, user_id, project_name, status,
                            inputs_json, outputs_json)
      VALUES (gen_random_uuid(), %s, %s, %s, %s, %s)
      RETURNING id, user_id, project_name, status, inputs_json, outputs_json
    """
    params = (
        user_id,
        project_name.strip(),
        "draft",
        Json(inputs or {}),   # None gelse bile boş dict kaydediyoruz
        Json({}),             # outputs_json başlangıçta boş
    )

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
        conn.commit()
        return row
    except Exception:
        conn.rollback()
        raise
    finally:
        try:
            conn.close()
        except Exception:
            pass