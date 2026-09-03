import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { NavigationWrapper } from '@/components/common/NavigationWrapper';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SahayaK - Cooperative Gig Services',
  description: 'A cooperative-owned digital service marketplace connecting Labour Cooperative workers with households and institutions.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-gray-50 flex flex-col">
        <NavigationWrapper>
          {children}
        </NavigationWrapper>
        <Toaster />

        {/* Google Translate Script */}
        <Script id="google-translate-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'hi,en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
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
