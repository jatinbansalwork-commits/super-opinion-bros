import type { Metadata, Viewport } from "next";
import { Bungee, Press_Start_2P } from "next/font/google";
import "./globals.css";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "Super Opinion Bros",
  description:
    "A weird Nintendo-style internet debate adventure. 20 worlds. One final truth.",
  openGraph: {
    title: "Super Opinion Bros",
    description: "20 debates. One final truth.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#5C94FC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bungee.variable} ${pressStart.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
