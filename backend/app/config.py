import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "This_Is_The_Key")
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "instance", "watchly.db")

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")


# Ensure correct database URL format for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

class Config:
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Prevents unnecessary overhead
    SENDGRID_API_KEY = os.getenv("SENDGRID_DEV_API_KEY")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")
