import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  const siteUrl = "https://topfastfood.lol";
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
  ];

  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: brands } = await supabase.from("brands").select("id, updated_at");
    
    if (brands) {
      const brandRoutes = brands.map((brand) => ({
        url: `${siteUrl}/chain/${brand.id}`,
        lastModified: brand.updated_at ? new Date(brand.updated_at) : new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      }));
      routes.push(...brandRoutes);
    }
  }

  return routes;
}
