import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/common/components/theme-provider";
import { QueryProvider } from "@/common/components/query-provider";
import { AuthGuard } from "@/common/components/auth-guard";
import { Toaster } from "@/components/ui/sonner";
import { SendingProvider } from "@/contexts/SendingContext";
import { FloatingSendingStatus } from "@/components/envio-whatsapp/FloatingSendingStatus";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prospect Manager - BitOcean",
  description: "Sistema de gerenciamento de prospecção de negócios",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="pm-theme"
        >
          <QueryProvider>
            <AuthGuard>
              <SendingProvider>
                {children}
                <FloatingSendingStatus />
              </SendingProvider>
            </AuthGuard>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
