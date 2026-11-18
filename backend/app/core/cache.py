"""In-memory TTLCache implementation using cachetools for 15-minute TTL caching."""

import hashlib
import json
import threading
from typing import Any

from cachetools import TTLCache

# Thread-safe locks
_aqi_lock = threading.Lock()
_plan_lock = threading.Lock()

# 15-minute TTL caches (900 seconds)
# Stores up to 1024 unique items each
_city_aqi_cache = TTLCache(maxsize=1024, ttl=900)
_plan_cache = TTLCache(maxsize=1024, ttl=900)


def compute_cache_key(prefix: str, payload: Any) -> str:
    """Generate a deterministic SHA-256 hash string for caching arbitrary data."""
    if isinstance(payload, str):
        serialized = payload
    else:
        try:
            serialized = json.dumps(payload, sort_keys=True, default=str)
        except (TypeError, ValueError):
            serialized = str(payload)
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    return f"{prefix}:{digest}"


class ThreadSafeTTLCache:
    """Helper wrapper around cachetools.TTLCache with thread lock."""

    def __init__(self, cache_instance: TTLCache, lock: threading.Lock):
        self._cache = cache_instance
        self._lock = lock

    def get(self, key: str) -> Any | None:
        with self._lock:
            return self._cache.get(key)

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._cache[key] = value

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

    def size(self) -> int:
        with self._lock:
            return len(self._cache)


aqi_cache = ThreadSafeTTLCache(_city_aqi_cache, _aqi_lock)
plan_cache = ThreadSafeTTLCache(_plan_cache, _plan_lock)
