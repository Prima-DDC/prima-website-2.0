import type { Metadata } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "../globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin", "latin-ext"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "PRIMA Workspace",
  description: "PRIMA Due Diligence Consult internal workspace.",
  robots: { index: false, follow: false },
};

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-mist/40">
        <RegisterServiceWorker />
        <ConfirmProvider>{children}</ConfirmProvider>
      </body>
    </html>
  );
}
