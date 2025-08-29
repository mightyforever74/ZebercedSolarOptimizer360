from typing import Optional, Dict, Any, List
from uuid import UUID
from psycopg2.extras import RealDictCursor, Json
from src.db import get_db

# Draft'ın outputs_json'unu ve özet kolonlarını günceller.
def api_draft_upsert_outputs(
    draft_id: str | UUID,
    panel_count: int,
    total_energy_kw: float,
    panel_layout: List[Dict[str, Any]] | List[Any],  # koordinat listesi
) -> Optional[Dict[str, Any]]:
    # ---- doğrulama ----
    try:
        draft_uuid = UUID(str(draft_id))
    except Exception:
        raise ValueError("Geçersiz draft_id (UUID)")

    if not isinstance(panel_count, int) or panel_count < 0:
        raise ValueError("panel_count >= 0 olmalı")
    if not isinstance(total_energy_kw, (int, float)) or total_energy_kw < 0:
        raise ValueError("total_energy_kw >= 0 olmalı")

    # panel_layout boyutu / türü için koruma
    if panel_layout is None:
        panel_layout = []
    if not isinstance(panel_layout, list):
        raise ValueError("panel_layout bir liste olmalı")
    if len(panel_layout) > 20000:
        # çok büyük payload'ları engelle (DoS önlemi)
        raise ValueError("panel_layout çok büyük (20000+)")

    # DB'ye yazacağımız JSON patch
    outputs_patch = {
        "panel_layout": panel_layout,
        "panel_count": panel_count,
        "total_energy_kw": float(total_energy_kw),
    }

    sql = """
      UPDATE projects
         SET outputs_json    = COALESCE(outputs_json, '{}'::jsonb) || %s::jsonb,
             panel_count     = %s,
             total_energy_kw = %s,
             updated_at      = NOW()
       WHERE id = %s AND status = 'draft'
   RETURNING id, user_id, project_name, status, inputs_json, outputs_json, panel_count, total_energy_kw, updated_at
    """
    params = (Json(outputs_patch), panel_count, float(total_energy_kw), str(draft_uuid))

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
        conn.commit()
        return row  # None ise draft bulunamadı → üst katmanda 404
    except Exception:
        conn.rollback()
        raise
    finally:
        try:
            conn.close()
        except Exception:
            pass
