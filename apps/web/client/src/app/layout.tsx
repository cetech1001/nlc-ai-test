import './global.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next Level Coach AI - Classroom',
  description: 'AI-powered coaching platform',
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=0.9, maximum-scale=1.0"
        />
        <meta name="apple-mobile-web-app-title" content="Next Level Coach AI" />
        <title>Next Level Coach AI - Classroom</title>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/icon.svg" type="image/svg" sizes="any"/>
        <link rel="apple-touch-icon" href="/images/apple-icon.png" type="image/png" sizes="any"/>
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
      </body>
    </html>
  );
}
