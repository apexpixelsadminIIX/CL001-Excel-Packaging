import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const CATEGORY_PRIORITY = { eco: 1, plastic: 2, paper: 3, cornstarch: 4, foil: 5 };

export function useContent() {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data } = await api.get("/content");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function sortByPriority(products = []) {
  return [...products].sort(
    (a, b) => (CATEGORY_PRIORITY[a.category] || 99) - (CATEGORY_PRIORITY[b.category] || 99)
  );
}
