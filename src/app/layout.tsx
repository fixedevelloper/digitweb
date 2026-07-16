import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Digit-Gateway | Dashboard Core Fintech",
    description: "Infrastructure moderne de transfert d'argent connectée à l'API Laravel.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="h-full scroll-smooth">
        <body className={`${inter.className} h-full bg-slate-50 text-slate-900 antialiased`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}