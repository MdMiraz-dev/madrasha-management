import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { LanguageProvider } from '@/context/LanguageContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669',
};

export const metadata: Metadata = {
  title: "তা'লীম ইআরপি - আস-সুন্নাহ স্কিল ডেভেলপমেন্ট ইনস্টিটিউট",
  description: 'Complete Taleem ERP system for Madrasa & Skill Development Management',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/as_sunnah_logo.png',
    apple: '/images/as_sunnah_logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "তা'লীম ইআরপি",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
