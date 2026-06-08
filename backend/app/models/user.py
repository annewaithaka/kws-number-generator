#backend\app\models\user.py
from ..extensions import db
from ..utils import utcnow


class User(db.Model):
    """One of the (up to nine) people that numbers get assigned to."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)  # optional
    created_at = db.Column(db.DateTime, default=utcnow)

    # One user can have many number assignments.
    assignments = db.relationship("Assignment", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.name}>"
