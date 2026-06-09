#backend\app\routes\__init__.py
def register_blueprints(app):
    """Register route blueprints. One line per feature as we build them."""
    from .auth import auth_bp
    from .users import users_bp
    from .numbers import numbers_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(numbers_bp)
