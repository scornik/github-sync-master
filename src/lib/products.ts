import { queryOptions } from "@tanstack/react-query";
import type { Product } from "./catalog";
import demo from "./demo-products.json";

// Demo catalog (no database connected yet).
export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> =>
    (demo as Array<Product & { days: number }>).map((p) => ({
      ...p,
      created_at: new Date(Date.now() - p.days * 86400000).toISOString(),
    })),
  staleTime: 60_000,
});
