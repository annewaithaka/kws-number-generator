#backend\app\routes\numbers.py
import csv
import io

from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import User, Assignment
from ..utils import generate_unique_number

# All routes here live under /api/numbers
numbers_bp = Blueprint("numbers", __name__, url_prefix="/api/numbers")


def assignment_to_dict(a):
    """Turn an Assignment row into plain JSON-friendly data."""
    return {
        "id": a.id,
        "number": a.number,
        "user_id": a.user_id,
        "user_name": a.user.name if a.user else None,
        "note": a.note,
        "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
    }


def _filtered_query(args):
    """Build the assignment query from search / filter / sort query params.

    Supported params:
        search   - partial, case-insensitive match on number, note, or user name
        user_id  - restrict to a single user's numbers
        sort     - 'number' | 'user' | 'date'   (default: 'date')
        order    - 'asc' | 'desc'               (default: 'desc')
    """
    query = Assignment.query.join(User)

    user_id = args.get("user_id")
    if user_id:
        try:
            query = query.filter(Assignment.user_id == int(user_id))
        except (TypeError, ValueError):
            pass

    search = (args.get("search") or "").strip()
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Assignment.number.ilike(like),
                Assignment.note.ilike(like),
                User.name.ilike(like),
            )
        )

    sort = (args.get("sort") or "date").lower()
    order = (args.get("order") or "desc").lower()
    columns = {
        "number": Assignment.number,
        "user": User.name,
        "date": Assignment.assigned_at,
    }
    col = columns.get(sort, Assignment.assigned_at)
    query = query.order_by(col.asc() if order == "asc" else col.desc())

    return query


@numbers_bp.post("")
@jwt_required()
def generate_and_assign():
    """Generate a unique 5-digit number and assign it to a user."""
    data = request.get_json(silent=True) or {}

    try:
        user_id = int(data.get("user_id"))
    except (TypeError, ValueError):
        return jsonify(error="A valid user_id is required."), 400

    note = (data.get("note") or "").strip() or None

    user = db.session.get(User, user_id)
    if user is None:
        return jsonify(error="User not found."), 404

    def is_taken(num):
        return db.session.query(Assignment.id).filter_by(number=num).first() is not None

    try:
        number = generate_unique_number(is_taken)
    except RuntimeError as exc:
        return jsonify(error=str(exc)), 409

    assignment = Assignment(number=number, user_id=user.id, note=note)
    db.session.add(assignment)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(error="That number was just taken; please try again."), 409

    return jsonify(assignment_to_dict(assignment)), 201


@numbers_bp.get("")
@jwt_required()
def list_numbers():
    """List assignments with optional search, user filter, and sorting."""
    items = _filtered_query(request.args).all()
    return jsonify([assignment_to_dict(a) for a in items]), 200


@numbers_bp.get("/export")
@jwt_required()
def export_numbers():
    """Export the (optionally filtered) list as a downloadable CSV."""
    items = _filtered_query(request.args).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Number", "User", "Note", "Assigned At"])
    for a in items:
        writer.writerow([
            a.number,
            a.user.name if a.user else "",
            a.note or "",
            a.assigned_at.isoformat() if a.assigned_at else "",
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=kws_numbers.csv"},
    )


@numbers_bp.patch("/<int:assignment_id>")
@jwt_required()
def update_note(assignment_id):
    """Edit only the note on a record. Number, user, and date are permanent."""
    assignment = db.session.get(Assignment, assignment_id)
    if assignment is None:
        return jsonify(error="Record not found."), 404

    data = request.get_json(silent=True) or {}
    # Empty/blank note clears it back to nothing.
    assignment.note = (data.get("note") or "").strip() or None
    db.session.commit()
    return jsonify(assignment_to_dict(assignment)), 200
