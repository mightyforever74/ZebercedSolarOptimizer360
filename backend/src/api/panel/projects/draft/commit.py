from typing import Optional, Dict, Any
from uuid import UUID
from psycopg2.extras import RealDictCursor
from src.db import get_db

def api_draft_commit(draft_id: str | UUID, user_id: int | None = None) -> Optional[Dict[str, Any]]:
    """
    Verilen draft kaydı 'final' durumuna geçirir.
    user_id verilmişse, sahiplik kontrolü de yapılır.
    Bulunamazsa None döner.
    """
    # ---- doğrulama ----
    try:
        draft_uuid = UUID(str(draft_id))
    except Exception:
        raise ValueError("Geçersiz draft_id (UUID)")

    if user_id is not None and (not isinstance(user_id, int) or user_id <= 0):
        raise ValueError("Geçersiz user_id")

    # user_id filtreli/filtre siz SQL’i derle
    base_sql = """
      UPDATE projects
         SET status    = %s,
             updated_at = NOW()
       WHERE id      = %s
         AND status  = %s
    """
    params: list[Any] = ["final", str(draft_uuid), "draft"]

    if user_id is not None:
        base_sql += " AND user_id = %s"
        params.append(user_id)

    base_sql += """
   RETURNING id, user_id, project_name, status, inputs_json, outputs_json, panel_count, total_energy_kw, updated_at
    """

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(base_sql, tuple(params))
            row = cur.fetchone()
        conn.commit()
        return row  # None ise: kayit yok / yetki yok / zaten final
    except Exception:
        conn.rollback()
        raise
    finally:
        try:
            conn.close()
        except Exception:
            pass
