import { queryOptions } from "@tanstack/react-query";
import type { Product } from "./catalog";
import { supabase } from "@/integrations/supabase/client";

// Catalog is read from Lovable Cloud (products + product_variants).
export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id,slug,name,sku,description,category,gender,occasion,fabric,price,sale_price,image_key,alt_image_key,is_new,is_bestseller,popularity,created_at,product_variants(id,color,color_hex,size,stock)",
      )
      .eq("is_active", true)
      .order("popularity", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Product[];
  },
  staleTime: 60_000,
});
