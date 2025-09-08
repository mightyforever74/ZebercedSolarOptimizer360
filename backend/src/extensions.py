# src/extensions.py
# src/extensions.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Uygulama oluşturulmadan önce tanımlanır; app içinde init_app ile bağlanır.
limiter = Limiter(key_func=get_remote_address)
