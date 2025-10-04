import "./globals.css";
import type { ReactNode } from "react";
import ClientOnly from "@/components/ClientOnly";

export const metadata = { title: "SportDash", description: "Teylingereind" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body suppressHydrationWarning className="min-h-screen bg-gray-50">
        <ClientOnly>{children}</ClientOnly>
      </body>
    </html>
  );
}
