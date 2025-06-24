import { Navigation } from '@/components/Navigation';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'Minneslund - Digitala Minneslundar',
  description: 'Skapa vackra digitala minneslundar som hedrar och bevarar minnen av dina nära och kära.',
  keywords: 'minneslund, digital memorial, minne, begravning, NFC, QR-kod',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://minneslund.vercel.app'),
  openGraph: {
    title: 'Minneslund - Digitala Minneslundar',
    description: 'Skapa vackra digitala minneslundar som hedrar och bevarar minnen av dina nära och kära.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6B7C6B" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-pearl-50 text-granite-800 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 