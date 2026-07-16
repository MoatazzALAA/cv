// hooks/useContent.ts
//
// Generic async data-fetching mechanics against the ContentAdapter, plus one
// typed "sugar" hook per content domain. Components should always reach for
// the sugar hooks below (useProfile, useExperiences, etc.) — the generic
// useContentData is exported mainly so a future content domain (e.g. once
// projects.json exists) can get its own sugar hook without duplicating the
// loading/error plumbing.

import { useState, useEffect, useCallback } from "react";
import { useContentAdapter } from "@/context/ContentContext";
import type {
  ContentAdapter,
  Profile,
  HomeContent,
  ExperiencesContent,
  SkillsContent,
  CertificatesContent,
  GlobalDesignConfig,
} from "@/types";

interface UseContentState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Generic hook for fetching any content domain through the adapter.
 * @param fetchMethod a function that calls one ContentAdapter method,
 *                     e.g. (adapter) => adapter.getProfile()
 */
export function useContentData<T>(
  fetchMethod: (adapter: ContentAdapter) => Promise<T>
): UseContentState<T> {
  const adapter = useContentAdapter();
  const [state, setState] = useState<UseContentState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Stabilizes the fetch call across renders so the effect below doesn't
  // re-run just because the caller passed a fresh arrow function each time.
  const stableFetch = useCallback(fetchMethod, [fetchMethod]);

  useEffect(() => {
    let isMounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    stableFetch(adapter)
      .then((result) => {
        if (isMounted) {
          setState({ data: result, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [adapter, stableFetch]);

  return state;
}

// ─────────────────────────────────────────────────────────────
// Typed sugar hooks — one per content domain
// ─────────────────────────────────────────────────────────────

export const useProfile = () => useContentData<Profile>((a) => a.getProfile());

export const useHomeContent = () =>
  useContentData<HomeContent>((a) => a.getHomeContent());

export const useExperiences = () =>
  useContentData<ExperiencesContent>((a) => a.getExperiences());

export const useSkills = () => useContentData<SkillsContent>((a) => a.getSkills());

export const useCertifications = () =>
  useContentData<CertificatesContent>((a) => a.getCertifications());

export const useGlobalDesignConfig = () =>
  useContentData<GlobalDesignConfig>((a) => a.getGlobalDesignConfig());
