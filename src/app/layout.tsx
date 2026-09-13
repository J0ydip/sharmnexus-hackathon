import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { NavigationWrapper } from '@/components/common/NavigationWrapper';
import { FloatingAIAssistant } from '@/components/chat/FloatingAIAssistant';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ShramNexus - Professional Services',
  description: 'Book verified professionals for your everyday needs.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png?v=3', sizes: 'any' },
      { url: '/favicon.png?v=3', type: 'image/png' },
    ],
    shortcut: '/logo.png?v=3',
    apple: '/logo.png?v=3',
  },
};

export const viewport: Viewport = {
  themeColor: '#24172f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..405,100..1000;1,9..405,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Great+Vibes&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" async></script>
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png?v=3" />
        <link rel="shortcut icon" href="/logo.png?v=3" />
        <link rel="apple-touch-icon" href="/logo.png?v=3" />
      </head>
      <body className="antialiased min-h-screen">
        <NavigationWrapper>
          {children}
        </NavigationWrapper>
        <FloatingAIAssistant />
        <Toaster />
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="afterInteractive" />

        {/* Google Translate Script */}
        <Script id="google-translate-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,bn,mr,te,ta',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
          `
        }} />
        <Script 
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}
