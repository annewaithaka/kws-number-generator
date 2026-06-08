#backend\app\models\admin.py
from werkzeug.security import generate_password_hash, check_password_hash

from ..extensions import db
from ..utils import utcnow


class Admin(db.Model):
    """The single admin who logs in and runs everything."""
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    def set_password(self, password):
        """Hash and store a plain-text password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Return True if the given password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<Admin {self.username}>"
