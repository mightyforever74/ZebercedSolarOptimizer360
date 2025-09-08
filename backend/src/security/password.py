# security/password.py
# C:\Projects\solar-optimizer360\src\security\password.py
import os
import bcrypt

def _rounds() -> int:
    try:
        # 4–15 arası güvenli, prod için 12–13 ideal
        return max(4, min(15, int(os.getenv("BCRYPT_ROUNDS", "12"))))
    except Exception:
        return 12

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(
        plain.encode("utf-8"),
        bcrypt.gensalt(rounds=_rounds())
    ).decode("utf-8")

def check_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
