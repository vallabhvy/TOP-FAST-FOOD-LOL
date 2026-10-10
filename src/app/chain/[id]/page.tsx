// Server Component for SEO generation

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  // Use the admin service key or just public anon key since it's a public table
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  if (!supabaseUrl || !supabaseServiceKey) return {};

  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: brand } = await adminClient.from("brands").select("name, current_slogan").eq("id", id).single();
  
  if (!brand) return {};

  return {
    title: `${brand.name} | TOPFASTFOOD.LOL`,
    description: `Read the live petty roasts and boosts for ${brand.name}: "${brand.current_slogan}"`,
    openGraph: {
      title: `${brand.name} | TOPFASTFOOD.LOL`,
      description: `Read the live petty roasts and boosts for ${brand.name}: "${brand.current_slogan}"`,
      url: `https://topfastfood.lol/chain/${id}`,
      siteName: "TOPFASTFOOD.LOL",
      images: [
        {
          url: "/logo.jpg",
          width: 1200,
          height: 1200,
          alt: brand.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} | TOPFASTFOOD.LOL`,
      description: `Read the live petty roasts and boosts for ${brand.name}: "${brand.current_slogan}"`,
      images: ["/logo.jpg"],
    },
  };
}

import ChainClient from "./ChainClient";

export default async function ChainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChainClient id={id} />;
}
