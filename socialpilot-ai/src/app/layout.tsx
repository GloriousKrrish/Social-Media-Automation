import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

export const metadata: Metadata = {
  title: {
    default: "SocialPilot AI — Enterprise Foundation",
    template: "%s | SocialPilot AI",
  },
  description:
    "Enterprise Agentic AI Social Media Automation Platform built on Next.js 16 and FastAPI.",
  keywords: [
    "AI social media automation",
    "agentic AI",
    "enterprise SaaS",
  ],
  authors: [{ name: "SocialPilot AI" }],
  creator: "SocialPilot AI",
  metadataBase: new URL("https://socialpilot.ai"),
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FDFBF7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <RealtimeProvider>{children}</RealtimeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
