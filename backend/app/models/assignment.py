#backend\app\models\assignment.py
from ..extensions import db
from ..utils import utcnow


class Assignment(db.Model):
    """A single 5-digit number assigned to a user."""
    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True)
    # Stored as a 5-character string; unique=True enforces "unique forever".
    number = db.Column(db.String(5), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    note = db.Column(db.Text, nullable=True)  # optional, per our Step 2 decision
    assigned_at = db.Column(db.DateTime, default=utcnow)

    def __repr__(self):
        return f"<Assignment {self.number} -> user {self.user_id}>"
