import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {ReactNode} from "react";
import "./global.css";

const poppins = Poppins({
    weight: ['500', '600'],
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: "Next Level Coach AI - Exclusive Access",
    description: "Join the exclusive Next Level Coach Vault - AI automation for elite coaches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=0.9, maximum-scale=1.0"
        />
        <meta name="apple-mobile-web-app-title" content="Next Level Coach AI" />
        <title>Next Level Coach AI</title>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/icon.svg" type="image/svg" sizes="any"/>
        <link rel="apple-touch-icon" href="/images/apple-icon.png" type="image/png" sizes="any"/>
    </head>
      <body className={`${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
