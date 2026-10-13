"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  dashboardGetHero,
  dashboardUpdateHero,
  dashboardUpdateHeroStats,
} from "@/lib/services/hero.services";
import { TAGS } from "@/lib/api/tags";
import type { HomeData, HomeHero, HomeStat } from "@/lib/types/hero";

export const homeQueryKey = [TAGS.home] as const;

type HomeCache = { previous: HomeData | undefined };

/**
 * Dashboard read for the home section.
 *
 * `initialData` is the server-rendered payload, so the first paint is instant
 * and the form hydrates with the exact same values the browser already has.
 * Retry/backoff comes from the QueryClient defaults in `app/dashboard/providers`.
 */
export function useHomeQuery(initial: HomeData) {
  return useQuery({
    queryKey: homeQueryKey,
    queryFn: dashboardGetHero,
    initialData: initial,
    staleTime: 30_000,
  });
}

export interface PublishHeroVars {
  formData: FormData;
  /** Value written into the cache immediately, before the network settles. */
  optimistic: HomeHero;
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

  return useMutation<HomeHero, Error, PublishHeroVars, HomeCache>({
    mutationKey: [...homeQueryKey, "hero"],
    mutationFn: ({ formData }) => dashboardUpdateHero(formData),
    onMutate: async ({ optimistic }) => {
      await queryClient.cancelQueries({ queryKey: homeQueryKey });
      const previous = queryClient.getQueryData<HomeData>(homeQueryKey);
      if (previous) {
        queryClient.setQueryData<HomeData>(homeQueryKey, {
          ...previous,
          hero: optimistic,
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(homeQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish hero");
    },
    onSuccess: (hero) => {
      queryClient.setQueryData<HomeData>(homeQueryKey, (prev) =>
        prev ? { ...prev, hero: { ...prev.hero, ...hero } } : prev,
      );
      toast.success("Hero section published");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
}

/** Publish all stats at once — the backend replaces the whole array. */
export function usePublishStats() {
  const queryClient = useQueryClient();

  return useMutation<HomeStat[], Error, HomeStat[], HomeCache>({
    mutationKey: [...homeQueryKey, "stats"],
    mutationFn: (stats) => dashboardUpdateHeroStats(stats),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: homeQueryKey });
      const previous = queryClient.getQueryData<HomeData>(homeQueryKey);
      if (previous) {
        queryClient.setQueryData<HomeData>(homeQueryKey, {
          ...previous,
          stats: next,
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(homeQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish stats");
    },
    onSuccess: (stats) => {
      queryClient.setQueryData<HomeData>(homeQueryKey, (prev) =>
        prev ? { ...prev, stats } : prev,
      );
      toast.success("Statistics published");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: homeQueryKey });
    },
  });
}
