"""Security utilities: input sanitization, XML delimiter injection wrapping, and SlowAPI rate limiting."""

import re

from slowapi import Limiter
from slowapi.util import get_remote_address

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


def sanitize_input(text: str, max_length: int = 200) -> str:
    """
    Sanitize text input by removing script tags, control characters,
    untrusted HTML, and enforcing a maximum length.
    """
    if not isinstance(text, str):
        return ""
    # Strip script and style blocks with their contents
    clean = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", text, flags=re.IGNORECASE | re.DOTALL)
    # Strip control characters
    clean = CONTROL_CHARS_PATTERN.sub("", clean)
    # Strip any remaining HTML tags
    clean = re.sub(r"<[^>]*>", "", clean)
    # Neutralize XML tag delimiters to prevent delimiter injection
    clean = clean.replace("<", "&lt;").replace(">", "&gt;")
    # Strip whitespace & enforce max length
    return clean.strip()[:max_length]


def wrap_user_input(text: str, max_length: int = 200) -> str:
    """
    Wrap user input inside strict XML delimiter tags (<user_input>)
    to isolate untrusted strings within GenAI prompts.
    """
    cleaned = sanitize_input(text, max_length=max_length)
    return f"<user_input>\n{cleaned}\n</user_input>"


def detect_prompt_injection(text: str) -> bool:
    """Check if input text matches adversarial prompt injection or jailbreak patterns."""
    if not text:
        return False
    normalized = text.strip()
    for pattern in INJECTION_PATTERNS:
        if pattern.search(normalized):
            return True
    return False
