import './globals.css';
import Providers from './providers';
import React from 'react';

export const metadata = {
  title: "IndiTrade - India's Premier B2B Wholesale Sourcing Marketplace (Alibaba for India)",
  description: "IndiTrade is a premium Indian B2B wholesale marketplace connecting verified Indian manufacturers, factory clusters, and global buyers. Sourced from Morbi, Surat, Tirupur, and Aligarh.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
