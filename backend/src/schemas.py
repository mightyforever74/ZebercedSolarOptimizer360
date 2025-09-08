# src/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class ContactIn(BaseModel):
    project_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=64)
    subject: str = Field(default="Drone randevusu", max_length=160)
    message: str = Field(min_length=1, max_length=5000)