"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  dashboardGetPageSeo,
  dashboardGetSettings,
  dashboardUpdatePageSeo,
  dashboardUpdateSettings,
  dashboardUpdateSettingsSeo,
  dashboardDeleteSocial,
  dashboardSaveSocial,
  dashboardSetupSocialLibrary,
  dashboardUpdateSocialPlacements,
  type PageSeoMap,
  type PageSeoValue,
} from "@/lib/services/settings.services";
import { TAGS } from "@/lib/api/tags";
import type { SocialPlacementMap } from "@/lib/socials";
import type { SiteSeo, SiteSettings } from "@/lib/types/settings";

export const siteSettingsQueryKey = [TAGS.settings] as const;
export const pageSeoQueryKey = [TAGS.seo, "pages"] as const;

type SettingsCache = { previous: SiteSettings | undefined };

/**
 * Dashboard read for the global settings.
 *
 * Retry/backoff comes from the QueryClient defaults in
 * `app/dashboard/providers`. No `initialData` here on purpose: the brand
 * section renders its own loading / error states from this query.
 */
export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: siteSettingsQueryKey,
    queryFn: dashboardGetSettings,
    staleTime: 30_000,
  });
}

/**
 * Publish the shared brand (name + logo/icon).
 *
 * Optimistic rollback mirrors the home section: snapshot on mutate, restore on
 * error, adopt the server payload on success.
 */
export function usePublishSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, Error, FormData, SettingsCache>({
    mutationKey: [...siteSettingsQueryKey, "brand"],
    mutationFn: (formData) => dashboardUpdateSettings(formData),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: siteSettingsQueryKey });
      const previous =
        queryClient.getQueryData<SiteSettings>(siteSettingsQueryKey);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(siteSettingsQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish site settings");
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(siteSettingsQueryKey, settings);
      toast.success("Brand settings published");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey });
    },
  });
}

/**
 * Social library writes answer with the full settings document, so the cache is
 * adopted in one go. Not optimistic: a logo upload has no result to show until
 * the server has stored it.
 */
function useSocialMutation<Vars>(
  mutationFn: (vars: Vars) => Promise<SiteSettings>,
  successMessage: string,
  fallbackError: string,
) {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, Error, Vars>({
    mutationFn,
    onSuccess: (settings) => {
      queryClient.setQueryData(siteSettingsQueryKey, settings);
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(error.message || fallbackError);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey });
    },
  });
}

export function useSetupSocialLibrary() {
  return useSocialMutation<void>(
    () => dashboardSetupSocialLibrary(),
    "Library is ready",
    "Failed to set up the library",
  );
}

export function useSaveSocial() {
  return useSocialMutation<{ id?: string; formData: FormData }>(
    ({ id, formData }) => dashboardSaveSocial(id, formData),
    "Social link saved",
    "Failed to save the social link",
  );
}

export function useDeleteSocial() {
  return useSocialMutation<string>(
    (id) => dashboardDeleteSocial(id),
    "Social link deleted",
    "Failed to delete the social link",
  );
}

export function usePublishSocialPlacements() {
  return useSocialMutation<SocialPlacementMap>(
    (placements) => dashboardUpdateSocialPlacements(placements),
    "Sections published",
    "Failed to publish the sections",
  );
}

/**
 * Publish the global SEO defaults (title/description/OG/twitter/siteUrl).
 * The response carries the full settings document, so the cache is patched in
 * one go.
 */
export function usePublishSiteSeo() {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, Error, SiteSeo, SettingsCache>({
    mutationKey: [...siteSettingsQueryKey, "seo"],
    mutationFn: (seo) => dashboardUpdateSettingsSeo(seo),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: siteSettingsQueryKey });
      const previous =
        queryClient.getQueryData<SiteSettings>(siteSettingsQueryKey);
      if (previous) {
        queryClient.setQueryData<SiteSettings>(siteSettingsQueryKey, {
          ...previous,
          seo: next,
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(siteSettingsQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish SEO defaults");
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(siteSettingsQueryKey, settings);
      toast.success("SEO defaults published");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey });
    },
  });
}

// ── Static-page SEO overrides ────────────────────────────────────────────────

/** Dashboard read for every static-page SEO override, keyed by page. */
export function usePageSeoQuery() {
  return useQuery({
    queryKey: pageSeoQueryKey,
    queryFn: dashboardGetPageSeo,
    staleTime: 30_000,
  });
}

type PageSeoCache = { previous: PageSeoMap | undefined };

/** Upsert one static page's SEO override. */
export function usePublishPageSeo() {
  const queryClient = useQueryClient();

  return useMutation<
    { page: string; seo: PageSeoValue },
    Error,
    { page: string; seo: PageSeoValue },
    PageSeoCache
  >({
    mutationKey: [...pageSeoQueryKey, "update"],
    mutationFn: ({ page, seo }) => dashboardUpdatePageSeo(page, seo),
    onMutate: async ({ page, seo }) => {
      await queryClient.cancelQueries({ queryKey: pageSeoQueryKey });
      const previous = queryClient.getQueryData<PageSeoMap>(pageSeoQueryKey);
      if (previous) {
        queryClient.setQueryData<PageSeoMap>(pageSeoQueryKey, {
          ...previous,
          [page]: seo,
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(pageSeoQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish page SEO");
    },
    onSuccess: ({ page }) => {
      toast.success(`"${page}" page SEO published`);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: pageSeoQueryKey });
    },
  });
}
