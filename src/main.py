from flask import Flask
from flask import Flask
from flask_cors import CORS # CORS açık (her yerden erişime izin veriyor)

# Blueprint’leri ekle
from export.export_pdf import export_pdf_bp # PDF üretimi
from export.export_comparison_pdf import export_comparison_pdf_bp
from ml.inference_server import inference_bp  # ✅ AI performance prediction endpoint
from ml.inference_rl import rl_inference_bp #  (RL panel yerleşimi tahmini)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Blueprint kayıtları
app.register_blueprint(export_pdf_bp, url_prefix="/export")
app.register_blueprint(export_comparison_pdf_bp, url_prefix="/export")
app.register_blueprint(inference_bp)  # /predict-performance
app.register_blueprint(rl_inference_bp, url_prefix="/ml")


if __name__ == "__main__":
    app.run(debug=True, port=5004, use_reloader=False)
