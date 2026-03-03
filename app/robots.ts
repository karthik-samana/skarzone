import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/skar/",
    },
    sitemap: `${process.env.NEXTAUTH_URL || "https://skar.vercel.app"}/sitemap.xml`,
  };
}
