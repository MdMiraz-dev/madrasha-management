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
  title: "তা'লীম ইআরপি - জামিয়া আরাবিয়া ইমদাদুল উলূম ফরিদাবাদ মাদ্রাসা, ঢাকা",
  description: 'জামিয়া আরাবিয়া ইমদাদুল উলূম ফরিদাবাদ মাদ্রাসা - তালীমাত, হিফজ ট্র্যাকার, দারুল ইক্বামা ও বায়তুল মাল ব্যবস্থাপনা সিস্টেম',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/faridabad_madrasa_logo.svg',
    apple: '/images/faridabad_madrasa_logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "তা'লীম ইআরপি - জামিয়া ফরিদাবাদ",
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
