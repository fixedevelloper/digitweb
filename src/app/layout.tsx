import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

// La Content-Security-Policy utilise un nonce généré à chaque requête (src/proxy.ts) :
// les pages doivent donc être rendues à la demande, jamais pré-générées au build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Digita-Gateway | Dashboard Core Fintech",
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