"""In-memory thread-safe TTLCache implementation using cachetools for 15-minute TTL caching.

Provides deterministic SHA-256 key hashing for arbitrary objects and
thread-locked storage wrappers to prevent race conditions in async workers.
"""

import hashlib
import json
import threading
from typing import Any

from cachetools import TTLCache

from app.core.constants import DEFAULT_CACHE_MAX_SIZE, DEFAULT_CACHE_TTL_SECONDS

# Thread-safe locks
_aqi_lock = threading.Lock()
_plan_lock = threading.Lock()

# 15-minute TTL caches (900 seconds)
_city_aqi_cache = TTLCache(maxsize=DEFAULT_CACHE_MAX_SIZE, ttl=DEFAULT_CACHE_TTL_SECONDS)
_plan_cache = TTLCache(maxsize=DEFAULT_CACHE_MAX_SIZE, ttl=DEFAULT_CACHE_TTL_SECONDS)


def compute_cache_key(prefix: str, payload: Any) -> str:
    """Generate a deterministic SHA-256 hash string for caching arbitrary data.

    Args:
        prefix: Namespace prefix (e.g., 'city_aqi', 'plan_response').
        payload: Arbitrary JSON-serializable object or string.

    Returns:
        Hex-encoded deterministic cache key formatted as '{prefix}:{sha256}'.
    """
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
    """Helper wrapper around cachetools.TTLCache with thread lock protection."""

    def __init__(self, cache_instance: TTLCache, lock: threading.Lock) -> None:
        """Initialize the thread-safe cache wrapper.

        Args:
            cache_instance: An initialized cachetools.TTLCache instance.
            lock: A threading.Lock instance to synchronize access.
        """
        self._cache = cache_instance
        self._lock = lock

    def get(self, key: str) -> Any | None:
        """Retrieve an item from cache if present and unexpired.

        Args:
            key: Target cache key.

        Returns:
            Cached value or None if missing or expired.
        """
        with self._lock:
            return self._cache.get(key)

    def set(self, key: str, value: Any) -> None:
        """Store an item in the cache with thread lock acquisition.

        Args:
            key: Target cache key.
            value: Value to persist in cache.
        """
        with self._lock:
            self._cache[key] = value

    def clear(self) -> None:
        """Purge all entries from the underlying cache store."""
        with self._lock:
            self._cache.clear()

    def size(self) -> int:
        """Return the current number of active entries in cache.

        Returns:
            Integer count of valid stored items.
        """
        with self._lock:
            return len(self._cache)


aqi_cache = ThreadSafeTTLCache(_city_aqi_cache, _aqi_lock)
plan_cache = ThreadSafeTTLCache(_plan_cache, _plan_lock)
