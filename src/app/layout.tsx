import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { NotificationProvider } from "@/contexts/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PPNS — Politeknik Perkapalan Negeri Surabaya",
    template: "%s | PPNS",
  },
  description:
    "Building Indonesia's Future Maritime Technology Ecosystem. PPNS adalah politeknik perkapalan terdepan di Indonesia dengan fokus pada teknologi maritim, inovasi industri 4.0, dan pendidikan vokasi bertaraf global.",
  openGraph: {
    title: {
      default: "PPNS — Smart Maritime Campus",
      template: "%s | PPNS",
    },
    description: "Building Indonesia's Future Maritime Technology Ecosystem",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <NotificationProvider>
          {children}
        </NotificationProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1E293B', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      </body>
    </html>
  );
}
