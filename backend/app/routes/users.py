#backend\app\routes\users.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import User

# All routes here live under /api/users
users_bp = Blueprint("users", __name__, url_prefix="/api/users")

# The system is specced for up to nine users.
MAX_USERS = 9


def user_to_dict(user):
    """Turn a User row into plain JSON-friendly data."""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "assignment_count": len(user.assignments),
    }


@users_bp.get("")
@jwt_required()
def list_users():
    """Return all users, sorted by name."""
    users = User.query.order_by(User.name.asc()).all()
    return jsonify([user_to_dict(u) for u in users]), 200


@users_bp.post("")
@jwt_required()
def create_user():
    """Create a new user (name required, email optional)."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip() or None

    if not name:
        return jsonify(error="Name is required."), 400

    if User.query.count() >= MAX_USERS:
        return jsonify(error=f"Maximum of {MAX_USERS} users reached."), 400

    if email and User.query.filter_by(email=email).first():
        return jsonify(error="A user with that email already exists."), 409

    user = User(name=name, email=email)
    db.session.add(user)
    db.session.commit()
    return jsonify(user_to_dict(user)), 201


@users_bp.put("/<int:user_id>")
@jwt_required()
def update_user(user_id):
    """Update a user's name and/or email."""
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify(error="User not found."), 404

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip() or None

    if not name:
        return jsonify(error="Name is required."), 400

    if email:
        clash = User.query.filter_by(email=email).first()
        if clash and clash.id != user.id:
            return jsonify(error="A user with that email already exists."), 409

    user.name = name
    user.email = email
    db.session.commit()
    return jsonify(user_to_dict(user)), 200


@users_bp.delete("/<int:user_id>")
@jwt_required()
def delete_user(user_id):
    """Delete a user, but only if they have no numbers assigned."""
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify(error="User not found."), 404

    if user.assignments:
        return jsonify(
            error="Cannot delete a user who has numbers assigned. "
                  "Those records must be kept."
        ), 409

    db.session.delete(user)
    db.session.commit()
    return jsonify(message="User deleted."), 200