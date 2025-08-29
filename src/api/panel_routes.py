# C:\Projects\solar-optimizer360\src\api\panel_routes.py
# Kullanıcıdan gelen çatı ve panel bilgileri ile,
# engelleri (obstacles) dikkate alarak güneş paneli yerleşimini hesaplamak
# ve sonucu JSON olarak döndürmek.

from flask import Blueprint, request, jsonify
from uuid import UUID
import json
import psycopg2.extras
from psycopg2.extras import RealDictCursor, Json


# Import get_db from your database utility module
from src.db import get_db  # Adjust the import path as needed
from src.api.panel.projects.draft.commit import api_draft_commit

# ML/AI modülleri varsa kullan, yoksa güvenli fallback
try:
    from src.ml.geometry.panel_layout_with_obstacles import calculate_panel_layout_with_obstacles as _calc_ml
    from src.ai.checker import check_panel_layout as _check_ml
    from src.ai.genetic_panel_optimizer import genetic_panel_placement as _genetic_ml
except Exception:
    _calc_ml = _check_ml = _genetic_ml = None

# ---------- Ortak yardımcılar ----------
def rectangles_overlap(a, b):
    return not (
        a["x"] + a["width"] <= b["x"] or
        a["x"] >= b["x"] + b["width"] or
        a["y"] + a["height"] <= b["y"] or
        a["y"] >= b["y"] + b["height"]
    )

def _rect(x, y, w, h):
    return {"x": x, "y": y, "width": w, "height": h}

def _collides(r, roof_w, roof_h, obstacles, placed, edge):
    # Çatı sınırı (kenar boşluğu dâhil)
    if (
        r["x"] < edge or
        r["y"] < edge or
        r["x"] + r["width"] > roof_w - edge or
        r["y"] + r["height"] > roof_h - edge
    ):
        return True
    # Engel çakışması
    for ob in obstacles or []:
        if rectangles_overlap(r, ob):
            return True
    # Mevcut panellerle çakışma
    for p in placed:
        if rectangles_overlap(r, p):
            return True
    return False

def row_step(panel_h: float, panel_gap: float, row_maintenance_gap: float, add_maintenance: bool) -> float:
    """Bir satırdan sonrakine geçerken eklenecek Y artışı."""
    return panel_h + panel_gap + (row_maintenance_gap if add_maintenance else 0.0)

# ---------- Grid hizalama + ters oryantasyon dolgu ----------
def _build_grid(roof_w, roof_h, pw, ph, gap, edge):
    """Kenar boşluğu dâhil edilerek grid hücreleri tanımlanır."""
    step_x = pw + gap
    step_y = ph + gap
    usable_w = max(0.0, (roof_w - 2 * edge))
    usable_h = max(0.0, (roof_h - 2 * edge))
    cols = max(1, int((usable_w + gap) // step_x))
    rows = max(1, int((usable_h + gap) // step_y))
    origin_x = edge
    origin_y = edge
    return origin_x, origin_y, step_x, step_y, cols, rows

def align_panels_to_grid(base_layout, roof_w, roof_h, pw, ph, gap, edge, obstacles):
    """
    RL (veya herhangi) yerleşimini en yakın grid hücresine 'snap' ederek hizalar.
    Hücre doluysa en yakın boş hücreye spiral arama yapar.
    Kenar boşluğu (edge) hesaba katılır.
    """
    ox, oy, step_x, step_y, cols, rows = _build_grid(roof_w, roof_h, pw, ph, gap, edge)

    def cell_rect(c, r):
        x = ox + c * step_x
        y = oy + r * step_y
        return _rect(x, y, pw, ph)

    taken = [[False]*cols for _ in range(rows)]
    placed = []

    def mark(c, r):
        if 0 <= r < rows and 0 <= c < cols:
            taken[r][c] = True
    def is_free(c, r):
        return (0 <= r < rows and 0 <= c < cols and not taken[r][c])

    for p in base_layout or []:
        # RL panelinin hücresini, kenar boşluğunu da dikkate alarak bul
        c = int(round((p["x"] - ox) / step_x))
        r = int(round((p["y"] - oy) / step_y))
        found = None
        for rad in range(0, max(cols, rows)):
            for dr in range(-rad, rad+1):
                for dc in range(-rad, rad+1):
                    cc, rr = c+dc, r+dr
                    if not is_free(cc, rr):
                        continue
                    cand = cell_rect(cc, rr)
                    if not _collides(cand, roof_w, roof_h, obstacles, placed, edge):
                        found = (cc, rr, cand)
                        break
                if found: break
            if found: break
        if found:
            cc, rr, cand = found
            placed.append(cand)
            mark(cc, rr)
        # bulunamazsa panel düşer (snap yeri yok)

    return placed

def fill_opposite_orientation(placed, roof_w, roof_h, pw, ph, gap, edge, obstacles):
    """
    Yerleşmiş (hizalanmış) panellerin arasındaki BOŞ grid hücrelerine,
    paneli ters oryantasyonda (pw↔ph) sığdırmayı dener.
    """
    rpw, rph = ph, pw  # rotate
    ox, oy, step_x, step_y, cols, rows = _build_grid(roof_w, roof_h, pw, ph, gap, edge)

    taken = [[False]*cols for _ in range(rows)]
    def cell_of(x, y):
        return int(round((x - ox) / step_x)), int(round((y - oy) / step_y))

    for p in placed:
        c, r = cell_of(p["x"], p["y"])
        if 0 <= r < rows and 0 <= c < cols:
            taken[r][c] = True

    extra = []
    for r in range(rows):
        for c in range(cols):
            if taken[r][c]:
                continue
            x = ox + c * step_x
            y = oy + r * step_y
            cand = _rect(x, y, rpw, rph)
            if not _collides(cand, roof_w, roof_h, obstacles, placed + extra, edge):
                extra.append(cand)
                taken[r][c] = True
    return extra

# ---------- API ----------
panel_bp = Blueprint("panel_bp", __name__, url_prefix="/api/panel")

@panel_bp.route("/calculate", methods=["POST"])
def calculate_panel():
    data = request.get_json() or {}
    panel_power_watt = data.get('panel_power_watt', 595)
    roof_w = float(data.get('roof_width', 0))
    roof_h = float(data.get('roof_height', 0))
    p_w = float(data.get('panel_width', 0))
    p_h = float(data.get('panel_height', 0))
    edge = float(data.get('edge_margin', 0))
    gap = float(data.get('panel_gap', 0))
    rmg = float(data.get('row_maintenance_gap', 0))
    rbg = int(data.get('rows_before_gap', 1))
    raw_obs = data.get('obstacles', [])

    # Engel normalizasyonu: {position:{x,y}, size:{width,height}} → {"x","y","width","height"}
    def normalize_obstacle(ob):
        if "x" in ob and "y" in ob and "width" in ob and "height" in ob:
            return { "x": float(ob["x"]), "y": float(ob["y"]), "width": float(ob["width"]), "height": float(ob["height"]) }
        pos = ob.get("position", {})
        size = ob.get("size", {})
        return {
            "x": float(ob.get("x", pos.get("x", 0))),
            "y": float(ob.get("y", pos.get("y", 0))),
            "width": float(ob.get("width", size.get("width", 1))),
            "height": float(ob.get("height", size.get("height", 1))),
        }
    obstacles = [normalize_obstacle(ob) for ob in raw_obs]

    # Kapasiteyi hesapla
    capacity = compute_capacity_area_guard(roof_w, roof_h, p_w, p_h, edge)

    params = dict(
        roof_width=roof_w,
        roof_height=roof_h,
        panel_width=p_w,
        panel_height=p_h,
        edge_margin=edge,
        panel_gap=gap,
        row_maintenance_gap=rmg,
        rows_before_gap=rbg,
        obstacles=obstacles,  # normalize edilmiş engeller
        panel_power_watt=float(panel_power_watt),
        max_panels=capacity
    )

    results = {}

    # 1) Classic (Grid) Hesaplama — ML varsa onu, yoksa yerel fonksiyonu kullan
    layout_vertical = (_calc_ml or calculate_panel_layout_with_obstacles)(**params) or []
    layout_horizontal = (_calc_ml or calculate_panel_layout_with_obstacles)(
        **{**params, "panel_width": params["panel_height"], "panel_height": params["panel_width"], "obstacles": obstacles}
    ) or []

    if len(layout_vertical) > len(layout_horizontal):
        best_layout = layout_vertical; best_orientation = "dikey"
    else:
        best_layout = layout_horizontal; best_orientation = "yatay"

    results["classic"] = {
        "panel_positions_vertical": layout_vertical,
        "panel_positions_horizontal": layout_horizontal,
        "panel_positions": best_layout,
        "total_panels": len(best_layout),
        "total_energy_kw": round((len(best_layout) * panel_power_watt) / 1000, 2),
        "vertical_panels": len(layout_vertical),
        "horizontal_panels": len(layout_horizontal),
        "orientation": best_orientation,
        "checker_issues": [],
    }

    # 2) AI Checker (Klasik + Akıllı Denetim)
    best_pw = p_w if best_orientation == "dikey" else p_h
    best_ph = p_h if best_orientation == "dikey" else p_w

    issues = run_checker(best_layout, obstacles, roof_w, roof_h, p_w, p_h)

    results["ai_checker"] = dict(results["classic"])
    results["ai_checker"]["checker_issues"] = issues if isinstance(issues, list) else []

    # 3) RL / Genetic / AI Optimizer
    if _genetic_ml:
        layout_rl = _genetic_ml(
            params["roof_width"], params["roof_height"],
            params["panel_width"], params["panel_height"],
            obstacles
        ) or []
        # Ek güvenlik:
        if len(layout_rl) > capacity:
            layout_rl = layout_rl[:capacity]
    else:
        layout_rl = []

    issues_rl = run_checker(layout_rl, obstacles, roof_w, roof_h, p_w, p_h)
    results["rl"] = {
        "panel_positions": layout_rl,
        "total_panels": len(layout_rl),
        "total_energy_kw": round((len(layout_rl) * panel_power_watt) / 1000, 2),
        "orientation": "ai",
        "checker_issues": issues_rl if isinstance(issues_rl, list) else [],
    }

    # 4) Post-process: en kalabalık sonucu grid’e hizala + ters oryantasyon dolgu
    candidates = [("classic", best_layout), ("rl", layout_rl)]
    base_for_post = max(candidates, key=lambda t: len(t[1]))[1]

    if base_for_post:
        pw_post = base_for_post[0]["width"]
        ph_post = base_for_post[0]["height"]
    else:
        pw_post, ph_post = p_w, p_h  # emniyet

    aligned = align_panels_to_grid(
        base_for_post, roof_w, roof_h, pw_post, ph_post, gap, edge, obstacles
    )
    extra = fill_opposite_orientation(
        aligned, roof_w, roof_h, pw_post, ph_post, gap, edge,
        obstacles  # normalize edilmiş engeller
    )

    results["postprocess"] = {
        "based_on": "classic_or_rl_max_panels",
        "aligned": {
            "panel_positions": aligned,
            "total_panels": len(aligned),
            "total_energy_kw": round((len(aligned) * params["panel_power_watt"]) / 1000, 2),
            "orientation": "aligned"
        },
        "extra_fill": {
            "panel_positions": aligned + extra,
            "added": len(extra),
            "total_panels": len(aligned) + len(extra),
            "total_energy_kw": round(((len(aligned)+len(extra)) * params["panel_power_watt"]) / 1000, 2),
            "orientation": "aligned+opposite"
        }
    }

    # --- META KAPASİTE BİLGİSİ ---
    results["meta"] = {
        "capacity_area_guard": capacity,
        "capacity_final": capacity,
        "capacity_capped": (
            len(best_layout) > capacity or len(layout_rl) > capacity
        )
    }

    return jsonify(results)

# --- CHECKER ADAPTER (6 argüman garantisi) ---
def run_checker(layout, obstacles, roof_w, roof_h, default_pw, default_ph):
    """
    _check_ml imzası: (layout, obstacles, roof_w, roof_h, panel_w, panel_h)
    Fazla argüman verilmesini engeller ve yatay/dikey durumunda
    panel ölçülerini layout'tan otomatik okur (yoksa default'u kullanır).
    """
    if layout and isinstance(layout, list):
        try:
            w = float(layout[0].get("width", default_pw))
            h = float(layout[0].get("height", default_ph))
        except Exception:
            w, h = float(default_pw), float(default_ph)
    else:
        w, h = float(default_pw), float(default_ph)

    checker = _check_ml or (lambda *a, **k: [])
    return checker(layout, obstacles, float(roof_w), float(roof_h), w, h)

# ---------- Yerel classic yerleşim (ML yoksa) ----------
def calculate_panel_layout_with_obstacles(
    roof_width,
    roof_height,
    panel_width,
    panel_height,
    edge_margin,
    panel_gap,
    row_maintenance_gap,
    rows_before_gap,
    obstacles=None,
    panel_power_watt=450,
    max_panels=None  # ← yeni parametre
):
    obstacles = obstacles or []
    layout = []
    current_y = edge_margin
    row_counter = 0

    # Satır satır yerleştir
    while current_y + panel_height <= roof_height - edge_margin + 1e-9:
        current_x = edge_margin
        while current_x + panel_width <= roof_width - edge_margin + 1e-9:
            if max_panels is not None and len(layout) >= max_panels:
                break
            panel_rect = {
                "x": round(current_x, 3),
                "y": round(current_y, 3),
                "width": panel_width,
                "height": panel_height,
                "power": panel_power_watt,
            }
            # Engellerle çakışma kontrolü
            overlap = False
            for obs in obstacles:
                ox = obs.get("x", obs.get("position", {}).get("x", 0))
                oy = obs.get("y", obs.get("position", {}).get("y", 0))
                ow = obs.get("width", 1)
                oh = obs.get("height", 1)
                if not (
                    panel_rect["x"] + panel_width <= ox or
                    panel_rect["x"] >= ox + ow or
                    panel_rect["y"] + panel_height <= oy or
                    panel_rect["y"] >= oy + oh
                ):
                    overlap = True
                    break
            if not overlap:
                layout.append(panel_rect)
            # X artışı: panel + gap
            current_x += panel_width + panel_gap

        # Y artışı: panel + gap + (bakım aralığı gerekiyorsa ekstra)
        row_counter += 1
        add_maint = (rows_before_gap > 0) and (row_counter % rows_before_gap == 0)
        current_y += row_step(panel_height, panel_gap, row_maintenance_gap, add_maint)

    # Basit “iyileştirme” denemesi (istersen kalsın)
    layout = iyilestirme(layout, obstacles, roof_width, roof_height, panel_width, panel_height)
    # Kapasiteyi aşarsa kırp
    if max_panels is not None:
        layout = layout[:max_panels]
    return layout

def kalan_bos_dikdortgenler(roof_w, roof_h, panel_list, engel_list):
    # Basit: tüm çatı alanı (örnek). Geliştirmek istersen rekürsif alan-parçalama uygulanır.
    return [{"x": 0, "y": 0, "width": roof_w, "height": roof_h}]

def panel_ve_engellerle_cakisiyor(panel, panel_list, engel_list):
    for p in panel_list + engel_list:
        if rectangles_overlap(panel, p):
            return True
    return False

def iyilestirme(panel_list, engel_list, roof_w, roof_h, panel_w, panel_h):
    for bos in kalan_bos_dikdortgenler(roof_w, roof_h, panel_list, engel_list):
        if bos["width"] >= panel_w and bos["height"] >= panel_h:
            yeni_panel = {"x": bos["x"], "y": bos["y"], "width": panel_w, "height": panel_h}
            if not panel_ve_engellerle_cakisiyor(yeni_panel, panel_list, engel_list):
                panel_list.append(yeni_panel)
    return panel_list

def compute_capacity_area_guard(roof_w, roof_h, panel_w, panel_h, edge):
    usable_w = max(0.0, roof_w - 2.0 * edge)
    usable_h = max(0.0, roof_h - 2.0 * edge)
    if usable_w <= 0.0 or usable_h <= 0.0 or panel_w <= 0.0 or panel_h <= 0.0:
        return 0
    from math import floor
    return int(floor((usable_w * usable_h) / (panel_w * panel_h)))

@panel_bp.route("/projects/commit", methods=["POST"])
def commit_project():
    data = request.get_json(force=True) or {}
    required = ["user_id", "project_name", "roof_width", "roof_height", "orientation", "panel_count"]
    missing = [k for k in required if data.get(k) in (None, "", [])]
    if missing:
        return jsonify(error=f"eksik alan(lar): {', '.join(missing)}"), 400

    conn = get_db()
    try:
        with conn.cursor() as cur:
            # user doğrula
            cur.execute("SELECT 1 FROM public.users WHERE id=%s", (data["user_id"],))
            if not cur.fetchone():
                return jsonify(error="user not found"), 404

            # INSERT
            cur.execute("""
                INSERT INTO public.projects (
                    user_id, project_name,
                    roof_width, roof_height,
                    orientation, panel_count,
                    edge_margin, panel_gap,
                    row_maintenance_gap, rows_before_gap,
                    obstacles, panel_layout,
                    panel_power_watt,
                    svg_image_path,
                    calculated_kw, created_at
                )
                VALUES (
                    %(user_id)s, %(project_name)s,
                    %(roof_width)s, %(roof_height)s,
                    %(orientation)s, %(panel_count)s,
                    %(edge_margin)s, %(panel_gap)s,
                    %(row_maintenance_gap)s, %(rows_before_gap)s,
                    %(obstacles)s, %(panel_layout)s,
                    %(panel_power_watt)s,
                    %(svg_image_path)s,
                    %(calculated_kw)s, NOW()
                )
                RETURNING id, calculated_kw, created_at
            """, {
                "user_id": int(data["user_id"]),
                "project_name": str(data["project_name"]),
                "roof_width": float(data["roof_width"]),
                "roof_height": float(data["roof_height"]),
                "orientation": str(data["orientation"]),
                "panel_count": int(data["panel_count"]),
                "edge_margin": data.get("edge_margin"),
                "panel_gap": data.get("panel_gap"),
                "row_maintenance_gap": data.get("row_maintenance_gap"),
                "rows_before_gap": data.get("rows_before_gap"),
                "obstacles": json.dumps(data.get("obstacles", [])),
                "panel_layout": json.dumps(data.get("panel_layout", [])),
                "panel_power_watt": data.get("panel_power_watt"),
                "svg_image_path": data.get("svg_image_path"),
                "calculated_kw": data.get("calculated_kw")
            })
            pid, calc_kw, created_at = cur.fetchone()

        conn.commit()
        return jsonify(
            project_id=str(pid),
            calculated_kw=calc_kw,
            created_at=created_at.isoformat(),
        ), 201
    except Exception as e:
        conn.rollback()
        return jsonify(error=str(e)), 500
    finally:
        try:
            conn.close()
        except:
            pass
@panel_bp.route("/projects/draft/save", methods=["POST"])
def save_draft():
    data = request.get_json(force=True) or {}
    user_id = int(data.get("user_id", 0))
    project_name = str(data.get("project_name") or "Untitled")
    inputs = data.get("inputs") or {}
    outputs = data.get("outputs") or {}

    conn = get_db()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # tabloyu genişlet (gerekirse oluştur)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS public.projects (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                        project_name TEXT NOT NULL,
                        roof_width DOUBLE PRECISION,
                        roof_height DOUBLE PRECISION,
                        orientation TEXT,
                        panel_count INTEGER,
                        calculated_kw DOUBLE PRECISION,
                        inputs_json JSONB,
                        outputs_json JSONB,
                        status TEXT NOT NULL DEFAULT 'draft',
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                """)
                cur.execute("""
                    INSERT INTO public.projects (user_id, project_name, inputs_json, outputs_json, status)
                    VALUES (%s, %s, %s, %s, 'draft')
                    RETURNING id, user_id, project_name, inputs_json, outputs_json, status, created_at, updated_at
                """, (user_id, project_name, json.dumps(inputs), json.dumps(outputs)))
                draft = cur.fetchone()
        return jsonify(draft), 200
    except Exception as e:
        conn.rollback()
        return jsonify(error=str(e)), 500
    finally:
        conn.close()


@panel_bp.route("/projects/draft/last", methods=["GET"])
def last_draft():
    user_id = int(request.args.get("user_id", 0))
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, user_id, project_name, inputs_json, outputs_json, status, created_at, updated_at
                  FROM public.projects
                 WHERE user_id=%s AND status='draft'
              ORDER BY updated_at DESC
                 LIMIT 1
            """, (user_id,))
            row = cur.fetchone()
        if not row:
            return jsonify(error="no draft found"), 404
        return jsonify(row), 200
    finally:
        conn.close()

# --- DRAFT AKIŞI: start, upsert-inputs, upsert-outputs, get ---
import json, psycopg2.extras
from src.db import get_db

def _json_dumps(obj):  # Türkçe karakter ve sayısal formatlar için güvenli dump
    return json.dumps(obj, ensure_ascii=False)

@panel_bp.route("/projects/draft/start", methods=["POST"])
def draft_start():
    data = request.get_json(force=True) or {}
    user_id      = int(data.get("user_id", 0))
    project_name = str(data.get("project_name") or "Untitled")
    inputs       = data.get("inputs") or {}

    # Üst kolona yansıtılacaklar (boş değilse)
    rw   = inputs.get("roof_width")
    rh   = inputs.get("roof_height")
    ori  = inputs.get("orientation")
    gps  = inputs.get("gps")
    elev = inputs.get("elevation")
    slp  = inputs.get("slope")

    conn = get_db()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                # INSERT: panel_count / calculated_kw vermiyoruz (DB default/nullable)
                cur.execute("""
                    INSERT INTO public.projects
                      (user_id, project_name,
                       roof_width, roof_height, orientation, gps, elevation, slope,
                       inputs_json, status)
                    VALUES
                      (%s,%s,%s,%s,%s,%s,%s,%s,%s,'draft')
                    RETURNING id, user_id, project_name, status, created_at, updated_at
                """, (
                    user_id, project_name,
                    rw, rh, ori, gps,
                    elev, slp,
                    _json_dumps(inputs)
                ))
                row = cur.fetchone()
        return jsonify(draft_id=row["id"], **row), 200
    except Exception as e:
        try: conn.rollback()
        except: pass
        return jsonify(error=str(e)), 500
    finally:
        try: conn.close()
        except: pass


@panel_bp.route("/projects/draft/upsert-inputs", methods=["POST"])
def draft_upsert_inputs():
    data = request.get_json(force=True) or {}
    raw_id = (str(data.get("draft_id") or "")).strip()
    if not raw_id:
        return jsonify(error="draft_id required"), 400

    partial  = data.get("inputs_partial") or {}

    # Üst kolonlara olası yansıyacak alanlar
    rw   = partial.get("roof_width")
    rh   = partial.get("roof_height")
    ori  = partial.get("orientation")
    gps  = partial.get("gps")
    elev = partial.get("elevation")
    slp  = partial.get("slope")

    conn = get_db()
    try:
        with conn:
            with conn.cursor() as cur:
                # JSONB merge
                cur.execute("""
                    UPDATE public.projects
                       SET inputs_json = COALESCE(inputs_json, '{}'::jsonb) || %s::jsonb,
                           updated_at  = NOW()
                     WHERE id::text = %s
                """, (json.dumps(partial, ensure_ascii=False), raw_id))

                # Üst kolonlar (varsa)
                sets, vals = [], []
                if rw  is not None: sets.append("roof_width = %s");   vals.append(rw)
                if rh  is not None: sets.append("roof_height = %s");  vals.append(rh)
                if ori is not None: sets.append("orientation = %s");  vals.append(ori)
                if gps is not None: sets.append("gps = %s");          vals.append(gps)
                if elev is not None:sets.append("elevation = %s");    vals.append(elev)
                if slp is not None: sets.append("slope = %s");        vals.append(slp)
                if sets:
                    q = "UPDATE public.projects SET " + ", ".join(sets) + ", updated_at=NOW() WHERE id::text = %s"
                    vals.append(raw_id)
                    cur.execute(q, vals)
        return jsonify(ok=True), 200
    except Exception as e:
        try: conn.rollback()
        except: pass
        return jsonify(error=str(e)), 500
    finally:
        try: conn.close()
        except: pass


@panel_bp.route("/projects/draft/upsert-outputs", methods=["POST"])
def draft_upsert_outputs():
    data = request.get_json(force=True) or {}
    raw_id = (str(data.get("draft_id") or "")).strip()
    if not raw_id:
        return jsonify(error="draft_id required"), 400

    partial  = data.get("outputs_partial") or {}
    panel_count = partial.get("panel_count")
    total_kw    = partial.get("total_energy_kw")

    conn = get_db()
    try:
        with conn:
            with conn.cursor() as cur:
                # JSONB merge
                cur.execute("""
                    UPDATE public.projects
                       SET outputs_json = COALESCE(outputs_json, '{}'::jsonb) || %s::jsonb,
                           updated_at   = NOW()
                     WHERE id::text = %s
                """, (json.dumps(partial, ensure_ascii=False), raw_id))

                # Özet kolonlar (rapor kolaylığı)
                sets, vals = [], []
                if panel_count is not None: sets.append("panel_count = %s");   vals.append(panel_count)
                if total_kw    is not None: sets.append("calculated_kw = %s"); vals.append(total_kw)
                if sets:
                    q = "UPDATE public.projects SET " + ", ".join(sets) + ", updated_at=NOW() WHERE id::text = %s"
                    vals.append(raw_id)
                    cur.execute(q, vals)

        return jsonify(ok=True), 200
    except Exception as e:
        try: conn.rollback()
        except: pass
        return jsonify(error=str(e)), 500
    finally:
        try: conn.close()
        except: pass


@panel_bp.route("/projects/draft/get", methods=["GET"])
def draft_get():
    raw_id = (request.args.get("draft_id") or "").strip()
    if not raw_id:
        return jsonify(error="draft_id required"), 400

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT id, user_id, project_name,
                       inputs_json, outputs_json,
                       roof_width, roof_height, orientation, gps, elevation, slope,
                       panel_count, calculated_kw,
                       status, created_at, updated_at
                  FROM public.projects
                 WHERE id::text = %s
            """, (raw_id,))
            row = cur.fetchone()
        if not row:
            return jsonify(error="draft not found"), 404
        return jsonify(row), 200
    finally:
        try: conn.close()
        except: pass


@panel_bp.route("/projects/draft/commit", methods=["POST", "OPTIONS"])
def draft_commit_route():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(force=True) or {}
    draft_id = data.get("draft_id")
    user_id  = data.get("user_id")  # opsiyonel; auth varsa oradan da alabilirsiniz

    try:
        uid = int(user_id) if user_id is not None else None
    except Exception:
        return jsonify(error="user_id sayısal olmalı"), 400

    try:
        row = api_draft_commit(draft_id, uid)
        if not row:
            # yok, yetkisiz, ya da zaten final
            return jsonify(error="Taslak bulunamadı veya zaten final"), 404
        return jsonify(ok=True, project=row)
    except ValueError as ve:
        return jsonify(error=str(ve)), 400
    except Exception:
        return jsonify(error="Bilinmeyen hata"), 500

