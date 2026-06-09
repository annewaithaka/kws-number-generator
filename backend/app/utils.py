#backend\app\utils.py
import random
from datetime import datetime, timezone

# 5-digit range: 10000-99999 (always exactly five digits, no leading zeros).
NUMBER_MIN = 10000
NUMBER_MAX = 99999


def utcnow():
    """Timezone-aware UTC timestamp (used as a model column default)."""
    return datetime.now(timezone.utc)


def generate_unique_number(is_taken, max_attempts=10000):
    """Return a 5-digit number (as a string) that isn't already taken.

    `is_taken(number)` must return True if that number already exists.
    Raises RuntimeError if no free number is found within max_attempts,
    which in practice means the whole range is full.
    """
    for _ in range(max_attempts):
        candidate = str(random.randint(NUMBER_MIN, NUMBER_MAX))
        if not is_taken(candidate):
            return candidate
    raise RuntimeError("Could not find a free 5-digit number; the range may be exhausted.")
