"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  dashboardGetSettings,
  dashboardUpdateSettings,
  dashboardUpdateSettingsSocials,
} from "@/lib/services/settings.services";
import { TAGS } from "@/lib/api/tags";
import type { SiteSettings, SiteSocial } from "@/lib/types/settings";

export const siteSettingsQueryKey = [TAGS.settings] as const;

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
 * Replace the whole shared social-links list. The response carries the full
 * settings document, so the cache is patched in one go.
 */
export function usePublishSocials() {
  const queryClient = useQueryClient();

  return useMutation<SiteSettings, Error, SiteSocial[], SettingsCache>({
    mutationKey: [...siteSettingsQueryKey, "socials"],
    mutationFn: (socials) => dashboardUpdateSettingsSocials(socials),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: siteSettingsQueryKey });
      const previous =
        queryClient.getQueryData<SiteSettings>(siteSettingsQueryKey);
      if (previous) {
        queryClient.setQueryData<SiteSettings>(siteSettingsQueryKey, {
          ...previous,
          socials: next,
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(siteSettingsQueryKey, context.previous);
      }
      toast.error(error.message || "Failed to publish social links");
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(siteSettingsQueryKey, settings);
      toast.success("Social links published");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey });
    },
  });
}
