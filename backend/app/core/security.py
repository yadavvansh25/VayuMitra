"""Security utilities: input sanitization, XML delimiter injection wrapping, and SlowAPI rate limiting.

Provides defense-in-depth protection against cross-site scripting (XSS),
control character corruption, XML delimiter injection, and prompt injection attacks.
"""

import re

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.constants import MAX_USER_INPUT_LENGTH

# Initialize SlowAPI rate limiter keyed by client remote IP
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Control characters regex
CONTROL_CHARS_PATTERN = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")

# Known prompt injection indicators
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?(previous|prior)\s+instructions?", re.IGNORECASE),
    re.compile(r"system\s+(override|prompt|instructions)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(a|an|in|acting\s+as)\s+(DAN|unfiltered|jailbreak)", re.IGNORECASE),
    re.compile(r"reveal\s+(your|the)\s+(system\s+)?(prompt|instructions|secret|keys?)", re.IGNORECASE),
    re.compile(r"bypass\s+(safety|content|filter|policy)", re.IGNORECASE),
    re.compile(r"<\|\s*im_start\s*\|>", re.IGNORECASE),
    re.compile(r"<\|\s*im_end\s*\|>", re.IGNORECASE),
    re.compile(r"</user_input>", re.IGNORECASE),  # Delimiter breakout attempt
]


def sanitize_input(text: str, max_length: int = MAX_USER_INPUT_LENGTH) -> str:
    """Sanitize text input by removing script tags, control characters, and untrusted HTML.

    Args:
        text: Untrusted input string.
        max_length: Maximum permissible length of sanitized string.

    Returns:
        Clean, escaped string bounded to max_length.
    """
    if not isinstance(text, str):
        return ""
    clean = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", text, flags=re.IGNORECASE | re.DOTALL)
    clean = CONTROL_CHARS_PATTERN.sub("", clean)
    clean = re.sub(r"<[^>]*>", "", clean)
    clean = clean.replace("<", "&lt;").replace(">", "&gt;")
    return clean.strip()[:max_length]


def wrap_user_input(text: str, max_length: int = MAX_USER_INPUT_LENGTH) -> str:
    """Wrap user input inside strict XML delimiter tags to isolate untrusted strings.

    Args:
        text: Untrusted user input.
        max_length: Maximum allowed length before wrapping.

    Returns:
        String enclosed in <user_input> tags.
    """
    cleaned = sanitize_input(text, max_length=max_length)
    return f"<user_input>\n{cleaned}\n</user_input>"


def detect_prompt_injection(text: str) -> bool:
    """Check if input text matches adversarial prompt injection or jailbreak patterns.

    Args:
        text: Target text to scan.

    Returns:
        True if any prompt injection signatures are detected, False otherwise.
    """
    if not text:
        return False
    normalized = text.strip()
    return any(pattern.search(normalized) for pattern in INJECTION_PATTERNS)
