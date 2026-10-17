"use client";

/**
 * Small data-loading hook for admin tabs.
 *
 * Usage: wrap the loader in useCallback — the effect re-runs whenever the
 * loader identity changes (e.g. when filter state changes) or when reload()
 * is called. Stale responses are discarded via the `cancelled` flag.
 */

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { isUnauthorizedError } from "./api";

export interface AdminData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Bump to re-run the current loader. */
  reload: () => void;
  /** Direct setter for optimistic updates. */
  setData: Dispatch<SetStateAction<T | null>>;
}

export function useAdminData<T>(loader: () => Promise<T>): AdminData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Flip to loading on a microtask so we never call setState synchronously
    // inside the effect body (react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });
    loader()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 401s are handled globally (page flips back to login).
        if (isUnauthorizedError(err)) return;
        setError(err instanceof Error && err.message ? err.message : "Could not load data.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loader, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload, setData };
}
