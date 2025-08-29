# bir çatının üzerine engelleri (obstacles) dikkate alarak güneş paneli yerleşimini hesaplar.
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
    max_panels=None,            # ← eklendi
    **kwargs,                   # ← fazladan argüman gelirse tolere et
):
    obstacles = obstacles or []

    layout = []
    # kullanılabilir alan
    usable_w = max(0.0, roof_width - 2 * edge_margin)
    usable_h = max(0.0, roof_height - 2 * edge_margin)

    step_x = panel_width + panel_gap
    step_y_base = panel_height + panel_gap  # ← dikeyde gap DAHİL

    # sağ kenarı güvenle korumak için +1e-9 tolerans
    y = edge_margin
    row = 0
    while y + panel_height <= roof_height - edge_margin + 1e-9:
        x = edge_margin
        while x + panel_width <= roof_width - edge_margin + 1e-9:
            if max_panels is not None and len(layout) >= max_panels:
                break
            panel = {
                "x": round(x, 3),
                "y": round(y, 3),
                "width": panel_width,
                "height": panel_height,
                "power": panel_power_watt,
            }
            # engel çakışması (position fallback’ı ile)
            intersects = any(
                not (
                    panel["x"] + panel["width"] <= (obs.get("x", obs.get("position", {}).get("x", 0))) or
                    panel["x"] >= (obs.get("x", obs.get("position", {}).get("x", 0)) + obs.get("width", 0)) or
                    panel["y"] + panel["height"] <= (obs.get("y", obs.get("position", {}).get("y", 0))) or
                    panel["y"] >= (obs.get("y", obs.get("position", {}).get("y", 0)) + obs.get("height", 0))
                )
                for obs in obstacles
            )
            if not intersects:
                layout.append(panel)

            x += step_x

        row += 1
        add_maint = rows_before_gap > 0 and (row % rows_before_gap == 0)
        y += step_y_base + (row_maintenance_gap if add_maint else 0.0)

        if max_panels is not None and len(layout) >= max_panels:
            break

    return layout[:max_panels]
