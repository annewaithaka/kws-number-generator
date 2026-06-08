#backend\app\routes\auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from ..extensions import db
from ..models import Admin

# All routes here live under /api/auth/...
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    """Verify username + password and return a JWT access token."""
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify(error="Username and password are required."), 400

    admin = Admin.query.filter_by(username=username).first()
    if admin is None or not admin.check_password(password):
        # Same message for both cases so we don't leak which one was wrong.
        return jsonify(error="Invalid username or password."), 401

    token = create_access_token(identity=str(admin.id))
    return jsonify(access_token=token, username=admin.username), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    """Return the logged-in admin's info (used by the frontend to confirm a token)."""
    admin_id = get_jwt_identity()
    admin = db.session.get(Admin, int(admin_id))
    if admin is None:
        return jsonify(error="Account not found."), 404
    return jsonify(id=admin.id, username=admin.username), 200


@auth_bp.post("/change-password")
@jwt_required()
def change_password():
    """Change the logged-in admin's password after verifying the current one."""
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if not current_password or not new_password:
        return jsonify(error="Current and new passwords are required."), 400

    if len(new_password) < 8:
        return jsonify(error="New password must be at least 8 characters."), 400

    admin_id = get_jwt_identity()
    admin = db.session.get(Admin, int(admin_id))
    if admin is None:
        return jsonify(error="Account not found."), 404

    if not admin.check_password(current_password):
        return jsonify(error="Current password is incorrect."), 401

    admin.set_password(new_password)
    db.session.commit()
    return jsonify(message="Password updated successfully."), 200