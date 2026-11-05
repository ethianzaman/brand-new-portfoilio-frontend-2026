"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  dashboardGetHero,
  dashboardUpdateHero,
  dashboardUpdateHeroStats,
} from "@/lib/services/hero.service";
import { TAGS } from "@/lib/api/tags";
import type { HeroData, HeroContent, HeroStat } from "@/lib/types/hero";

export const heroQueryKey = [TAGS.hero] as const;

type HeroCache = { previous: HeroData | undefined };

/**
 * Dashboard read for the home section.
 *
 * `initialData` is the server-rendered payload, so the first paint is instant
 * and the form hydrates with the exact same values the browser already has.
 * Retry/backoff comes from the QueryClient defaults in `app/dashboard/providers`.
 */
export function useHeroQuery(initial: HeroData) {
  return useQuery({
    queryKey: heroQueryKey,
    queryFn: dashboardGetHero,
    initialData: initial,
    staleTime: 30_000,
  });
}

export interface PublishHeroVars {
  formData: FormData;
  /** Value written into the cache immediately, before the network settles. */
  optimistic: HeroContent;
}

/**
 * Publish the hero section.
 *
 * Optimistic: the cache is updated the instant the button is pressed. On
 * failure the snapshot taken in `onMutate` is restored, so the dashboard never
 * shows a value the backend rejected.
 */
export function usePublishHero() {
  const queryClient = useQueryClient();

  return useMutation<HeroContent, Error, PublishHeroVars, HeroCache>({
    mutationKey: [...heroQueryKey, "hero"],
    mutationFn: ({ formData }) => dashboardUpdateHero(formData),
    onMutate: async ({ optimistic }) => {
      await queryClient.cancelQueries({ queryKey: heroQueryKey });
      const previous = queryClient.getQueryData<HeroData>(heroQueryKey);
      if (previous) {
        queryClient.setQueryData<HeroData>(heroQueryKey, {
          ...previous,
          hero: optimistic,
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(heroQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish hero");
    },
    onSuccess: (hero) => {
      queryClient.setQueryData<HeroData>(heroQueryKey, (prev) =>
        prev ? { ...prev, hero: { ...prev.hero, ...hero } } : prev,
      );
      toast.success("Hero section published");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: heroQueryKey });
    },
  });
}

/** Publish all stats at once — the backend replaces the whole array. */
export function usePublishStats() {
  const queryClient = useQueryClient();

  return useMutation<HeroStat[], Error, HeroStat[], HeroCache>({
    mutationKey: [...heroQueryKey, "stats"],
    mutationFn: (stats) => dashboardUpdateHeroStats(stats),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: heroQueryKey });
      const previous = queryClient.getQueryData<HeroData>(heroQueryKey);
      if (previous) {
        queryClient.setQueryData<HeroData>(heroQueryKey, {
          ...previous,
          stats: next,
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(heroQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish stats");
    },
    onSuccess: (stats) => {
      queryClient.setQueryData<HeroData>(heroQueryKey, (prev) =>
        prev ? { ...prev, stats } : prev,
      );
      toast.success("Statistics published");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: heroQueryKey });
    },
  });
}
