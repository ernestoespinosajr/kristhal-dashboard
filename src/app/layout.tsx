import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kristhal-dashboard.vercel.app"),
  title: "KRISTHAL — Dashboard",
  description: "Sistema de Planificación, Monitoreo y Evaluación",
  openGraph: {
    title: "KRISTHAL — Dashboard",
    description: "Sistema de Planificación, Monitoreo y Evaluación",
    images: [{ url: "/kristhal-isotipo.png", width: 512, height: 512 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
