#backend\app\__init__.py
from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .extensions import db, jwt


def create_app(config_class=Config):
    """Application factory: builds and configures the Flask app."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    # Import models so SQLAlchemy registers the tables, then create them.
    from . import models  # noqa: F401
    with app.app_context():
        db.create_all()

    # Register feature blueprints (filled in from Step 3 onwards).
    from .routes import register_blueprints
    register_blueprints(app)

    # Simple health check.
    @app.get("/api/health")
    def health():
        return jsonify(status="ok", message="KWS Numbers API is running")

    return app
