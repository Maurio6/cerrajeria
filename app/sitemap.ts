import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// ponytail: la web es una sola página; si creas más, agrégalas aquí.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url }];
}
