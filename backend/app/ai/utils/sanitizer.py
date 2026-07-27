import re

API_KEY_PATTERNS = [
    re.compile(r"sk-[a-zA-Z0-9]{32,}"),
    re.compile(r"AIzaSy[a-zA-Z0-9_-]{33}"),
    re.compile(r"sk-ant-[a-zA-Z0-9_-]{32,}"),
]


def sanitize_sensitive_data(text: str) -> str:
    """Mask secret API keys and credentials in log strings."""
    if not text:
        return ""
    sanitized = text
    for pattern in API_KEY_PATTERNS:
        sanitized = pattern.sub("[REDACTED_SECRET_KEY]", sanitized)
    return sanitized
