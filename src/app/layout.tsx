import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "أكاديمية البشائر لكرة القدم | نصنع أبطال المستقبل",
  description: "أكاديمية البشائر لكرة القدم - نكتشف المواهب ونصنع أبطال المستقبل. سجل طفلك الآن وانضم لعائلة البشائر.",
  keywords: "كرة قدم, أكاديمية, تدريب, مواهب, ناشئين, البشائر",
  openGraph: {
    title: "أكاديمية البشائر لكرة القدم",
    description: "نكتشف المواهب ونصنع أبطال المستقبل",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ErrorBoundary>
          <SettingsProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </SettingsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
