import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const requestHost = requestHeaders.get("host");
  const candidateHost = forwardedHost || requestHost || "localhost:3000";
  const safeHost = /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(candidateHost)
    ? candidateHost
    : "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol === "http" || safeHost.startsWith("localhost")
      ? "http"
      : "https";
  const origin = `${protocol}://${safeHost}`;
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title: "FLORA — Hijab & Women’s Fashion",
    description:
      "Modern modest wear shaped with intention. Discover FLORA hijabs, considered silhouettes and limited atelier pieces.",
    applicationName: "FLORA",
    authors: [{ name: "FLORA Brand" }],
    keywords: [
      "hijab",
      "modest fashion",
      "women's fashion",
      "Berlin",
      "FLORA Brand",
    ],
    icons: {
      icon: "/images/flora-logo-round.png",
      shortcut: "/images/flora-logo-round.png",
      apple: "/images/flora-logo-round.png",
    },
    openGraph: {
      title: "FLORA — Poise, in every fold.",
      description:
        "A new language of modesty: considered silhouettes, signature drapes and quiet confidence.",
      type: "website",
      siteName: "FLORA",
      images: [
        {
          url: socialImage,
          width: 1672,
          height: 941,
          alt: "FLORA — Poise, in every fold.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "FLORA — Poise, in every fold.",
      description:
        "Considered hijabs and modern modest wear, designed in Berlin.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
