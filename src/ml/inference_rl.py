import sys
import json
import os
sys.path.append(os.path.dirname(__file__))
# (Reinforcement Learning) endpoint kodu
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from rl_utils import run_rl_panel_layout

rl_inference_bp = Blueprint("inference_rl", __name__)
CORS(rl_inference_bp)  # CORS eklenmesi

@rl_inference_bp.route("/inference-rl", methods=["POST"])
def inference_rl():
    try:
        data = request.get_json()
        print("📥 [RL] API Gelen Payload:", json.dumps(data, indent=2))  # Giriş


        roof_width = int(data.get("roofWidth", 20))
        roof_height = int(data.get("roofHeight", 20))
        panel_width = int(data.get("panelWidth", 2))
        panel_height = int(data.get("panelHeight", 1))
        edge_margin = int(data.get("edgeMargin", 1))
        obstacles = data.get("obstacles", [])

        result = run_rl_panel_layout(
            roof_width,
            roof_height,
            (panel_width, panel_height),
            edge_margin,
            obstacles
        )
        print("📦 RL panel sayısı:", len(result))
        print("📏 RL panel örnek:", result[0] if result else "—")
        # NumPy int64 türlerini JSON uyumlu hale getir
        result = [
            {
                "x": int(p["x"]),
                "y": int(p["y"]),
                "width": int(p["width"]),
                "height": int(p["height"])
            }
            for p in result
        ]

        print("📤 [RL] API Yanıtı:", json.dumps({"panel_layout": result}, indent=2))  # Çıkış
 
        return jsonify({"panel_layout": result})

    except Exception as e:
        print("❌ [RL] API Exception:", str(e))
        return jsonify({"error": str(e)}), 500

#Fonksiyon Mantığı:
#Kullanıcıdan çatı ve panel ölçüleri ile engel listesi alıyor.

#RL tabanlı algoritma çalışıyor (run_rl_panel_layout() fonksiyonu ile).

#Her panelin konumunu ve boyutunu içeren dizi dönüyor (SVG ya da görsel yerleşime uygun format!).