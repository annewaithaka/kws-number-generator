#backend\app\utils.py
from datetime import datetime, timezone


def utcnow():
    """Timezone-aware UTC timestamp (used as a model column default)."""
    return datetime.now(timezone.utc)
