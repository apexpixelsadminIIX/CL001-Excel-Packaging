import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const CATEGORY_PRIORITY = { eco: 1, plastic: 2, paper: 3, cornstarch: 4, foil: 5 };

export function isPreview() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

export function useContent() {
  const preview = isPreview();
  return useQuery({
    queryKey: ["site-content", preview ? "draft" : "live"],
    queryFn: async () => {
      const { data } = await api.get(preview ? "/admin/content" : "/content");
      return data;
    },
    staleTime: preview ? 0 : 5 * 60 * 1000,
  });
}

export function useInstagramFeed(enabled) {
  return useQuery({
    queryKey: ["instagram-feed"],
    enabled: !!enabled,
    queryFn: async () => {
      const { data } = await api.get("/instagram/feed");
      return data.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function sortByPriority(products = []) {
  return [...products].sort((a, b) => {
    const fa = a.featured ? 0 : 1;
    const fb = b.featured ? 0 : 1;
    if (fa !== fb) return fa - fb;
    return (CATEGORY_PRIORITY[a.category] || 99) - (CATEGORY_PRIORITY[b.category] || 99);
  });
}
