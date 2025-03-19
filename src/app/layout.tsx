import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
export { metadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {/* Não mostrar o Navbar na página de login */}
            {children}
          </div>
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
} 