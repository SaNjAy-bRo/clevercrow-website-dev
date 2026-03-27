import type { Metadata } from 'next';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Website Development Packages | Custom Web Design Pricing - Clevercrow',
  description: 'Explore our website development packages designed for startups and businesses. Custom, responsive, SEO-friendly websites that convert visitors into leads.',
  keywords: 'website development packages, web design packages India, business website pricing, affordable web development services, custom website design plans, website development company India, SEO-ready websites, Clevercrow web design',
  openGraph: {
    type: 'website',
    url: 'https://clevercrow.in/website-development-packages/',
    title: 'Website Development Packages | Clevercrow',
    description: 'Professional, conversion-focused website packages for startups and growing brands. Built for speed, SEO, and results.',
    images: ['https://clevercrow.in/images/og-website-development-packages.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Development Packages | Clevercrow',
    description: 'Build a website that impresses and converts. Explore Clevercrow\'s high-performing, SEO-friendly web development packages.',
    images: ['https://clevercrow.in/images/og-website-development-packages.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${displayFont.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/images/favicon.png" />
      </head>
      <body className="has-sticky-cta bg-slate-50 text-slate-900 font-sans">
        {children}
        <Script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" strategy="lazyOnload" />
        <Script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" strategy="lazyOnload" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17335403082" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17335403082');
            gtag('config', 'AW-17335403082/uHSsCKf5i_QaEMqElcpA', {
              phone_conversion_number: '09986389444'
            });
          `}
        </Script>
        <Script id="wati-widget" strategy="lazyOnload">
          {`
            var url = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?73246';
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = url;
            var options = {
              enabled: true,
              chatButtonSetting: {
                backgroundColor: '#00e785',
                ctaText: 'Chat with us',
                borderRadius: '25',
                marginLeft: '0',
                marginRight: '20',
                marginBottom: '20',
                ctaIconWATI: false,
                position: 'right'
              },
              brandSetting: {
                brandName: 'Clever Crow Strategies LLP',
                brandImg: 'https://clevercrow.in/smm-packages/favicon.png',
                welcomeText: 'Hi there!\\nHow can I help you?',
                messageText: 'Hello, %0A I have a question about {{page_link}}',
                backgroundColor: '#00e785',
                ctaText: 'Chat with us',
                borderRadius: '25',
                autoShow: false,
                phoneNumber: '919986389444'
              }
            };
            s.onload = function () {
              if (typeof CreateWhatsappChatWidget === 'function') {
                CreateWhatsappChatWidget(options);
              }
            };
            var x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
          `}
        </Script>
      </body>
    </html>
  );
}
