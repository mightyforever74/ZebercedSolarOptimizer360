#C:\Projects\solar-optimizer360\src\api\panel\projects\draft\last.py
from typing import Optional, Dict, Any
from psycopg2.extras import RealDictCursor
from src.db import get_db

def api_draft_last(user_id: int) -> Optional[Dict[str, Any]]:
    """
    Verilen kullanıcı için en son güncellenmiş 'draft' projeyi döndürür.
    Kayıt yoksa None döner.

    Args:
        user_id: Kullanıcı kimliği (int)

    Returns:
        dict | None: {
            id, user_id, project_name, inputs_json, outputs_json, status, updated_at
        }
    """
    if not isinstance(user_id, int):
        # Dış katmandan yanlış tip gelmesini erken yakala
        raise ValueError("user_id must be an integer")

    sql = """
        SELECT id, user_id, project_name, inputs_json, outputs_json, status, updated_at
          FROM projects
         WHERE user_id = %s AND status = 'draft'
      ORDER BY updated_at DESC NULLS LAST
         LIMIT 1
    """
    params = (user_id,)

    conn = get_db()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
    return row
