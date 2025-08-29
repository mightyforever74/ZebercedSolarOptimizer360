from typing import Optional, Dict, Any
from uuid import UUID
from psycopg2.extras import RealDictCursor, Json
from src.db import get_db

# Draft'ın inputs_json'unu JSONB merge (||) ile kısmi günceller.
def api_draft_upsert_inputs(draft_id: str | UUID, inputs_partial: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    # ---- doğrulama ----
    try:
        draft_uuid = UUID(str(draft_id))
    except Exception:
        raise ValueError("Geçersiz draft_id (UUID)")

    if not isinstance(inputs_partial, dict) or not inputs_partial:
        raise ValueError("inputs_partial boş olamaz")

    # (isteğe bağlı) basit sınırlar — güvenlik/performans
    # sayısal alanları sınırla, obstacles uzunluğunu kısıtla vb.
    if "obstacles" in inputs_partial:
        obs = inputs_partial.get("obstacles") or []
        if not isinstance(obs, list):
            raise ValueError("obstacles bir liste olmalı")
        if len(obs) > 200:  # aşırı payload'a karşı üst limit örneği
            raise ValueError("obstacles çok uzun (200+)")
        # tekil item kontrolü (opsiyonel)
        for i, o in enumerate(obs[:200]):
            if not isinstance(o, dict):
                raise ValueError(f"obstacles[{i}] dict olmalı")

    sql = """
      UPDATE projects
         SET inputs_json = COALESCE(inputs_json, '{}'::jsonb) || %s::jsonb,
             updated_at  = NOW()
       WHERE id = %s AND status = 'draft'
   RETURNING id, user_id, project_name, status, inputs_json, outputs_json, updated_at
    """
    params = (Json(inputs_partial), str(draft_uuid))

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
        conn.commit()
        return row  # None ise draft yok/uyuşmadı → üst katmanda 404 ver
    except Exception:
        conn.rollback()
        raise
    finally:
        try:
            conn.close()
        except Exception:
            pass
