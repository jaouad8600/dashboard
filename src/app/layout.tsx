import "./globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
export const metadata = { title: "Teylingereind • Sport & Activiteiten", description: "Dashboard" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-dvh bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
