import "./globals.css";

export const metadata = {
  title: "Teylingereind",
  description: "Sport & Activiteiten",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-zinc-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
