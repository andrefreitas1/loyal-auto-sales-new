import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Loyal Auto Sales',
  description: 'Sistema de gerenciamento de veículos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          href="/logo/logo-preta.png"
          as="image"
          type="image/png"
        />
      </head>
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