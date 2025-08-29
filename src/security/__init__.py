# C:\Projects\solar-optimizer360\src\security\__init__.py
"""
Security helpers for password hashing & verification.
Usage:
    from security import hash_password, check_password
or:
    from security.password import hash_password, check_password
"""

from .password import hash_password, check_password

__all__ = ("hash_password", "check_password")
