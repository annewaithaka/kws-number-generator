#backend\app\config.py
import os
from datetime import timedelta

from dotenv import load_dotenv

# Load .env before we read any values from it.
load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-jwt-secret")
    # How long a login stays valid before the admin must log in again.
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    SQLALCHEMY_DATABASE_URI = "sqlite:///nmk_numbers.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
