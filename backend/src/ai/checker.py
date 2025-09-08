# src/ai/checker.py
def check_panel_layout(panel_list, obstacle_list, roof_w, roof_h, panel_w, panel_h):
    issues = []
    # 1. Çatı dışına taşan panel var mı?
    for i, panel in enumerate(panel_list):
        if (
            panel["x"] < 0 or
            panel["y"] < 0 or
            panel["x"] + panel["width"] > roof_w or
            panel["y"] + panel["height"] > roof_h
        ):
            issues.append(f"Panel {i+1} çatı dışına taşıyor.")
    # 2. Paneller çakışıyor mu?
    for i, p1 in enumerate(panel_list):
        for j, p2 in enumerate(panel_list):
            if i < j:
                if not (
                    p1["x"] + p1["width"] <= p2["x"] or
                    p1["x"] >= p2["x"] + p2["width"] or
                    p1["y"] + p1["height"] <= p2["y"] or
                    p1["y"] >= p2["y"] + p2["height"]
                ):
                    issues.append(f"Panel {i+1} Panel {j+1} ile çakışıyor.")
    # 3. Panel-engel çakışma kontrolü (engeller varsa)
    for i, panel in enumerate(panel_list):
        for j, obs in enumerate(obstacle_list):
            ox = obs.get("x", obs.get("position", {}).get("x", 0))
            oy = obs.get("y", obs.get("position", {}).get("y", 0))
            ow = obs.get("width", 1)
            oh = obs.get("height", 1)
            if not (
                panel["x"] + panel["width"] <= ox or
                panel["x"] >= ox + ow or
                panel["y"] + panel["height"] <= oy or
                panel["y"] >= oy + oh
            ):
                issues.append(f"Panel {i+1} Engel {j+1} ile çakışıyor.")
    # 4. Kalan boş alanlar (gelişmiş checker için ileride eklenebilir)
    return issues
