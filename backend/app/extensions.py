#backend\app\extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# Shared extension instances, created without an app so models.py and
# __init__.py can both import them without circular-import errors.
db = SQLAlchemy()
jwt = JWTManager()
