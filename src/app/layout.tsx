import "./globals.css";
export const metadata = { title: "SportDash", description: "Teylingereind" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
