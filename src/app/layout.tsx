import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth/auth-context'
import { CartSidebar } from '@/components/features/cart/cart-sidebar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oeste Pan - Panadería Artesanal | Pan Recién Horneado",
  description: "Panadería familiar desde 2008. Pan artesanal, pasteles y tortas horneados diariamente con ingredientes de primera calidad. Pedidos online disponibles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <CartSidebar />
        </AuthProvider>
      </body>
    </html>
  );
}
