
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SiteHeader from '@/components/SiteHeader';
import ChatAiWidget from '@/components/ChatAiWidget'; 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'KELOMPOK 6 - LogicLab',
  description: 'Aplikasi interaktif untuk mempelajari rangkaian digital, dilengkapi simulasi, perancang sirkuit, konverter bilangan, dan analisis AI oleh KELOMPOK 6.',
  openGraph: {
    title: 'KELOMPOK 6 - LogicLab',
    description: 'Aplikasi interaktif untuk mempelajari rangkaian digital oleh KELOMPOK 6.',
    images: [
      {
        url: 'https://placehold.co/1200x630.png?text=KELOMPOK+6+LogicLab', 
        width: 1200,
        height: 630,
        alt: 'KELOMPOK 6 LogicLab Preview',
      },
    ],
    locale: 'id_ID', 
    type: 'website',
  },
  icons: {
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} light`}>
      <head>
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-grow container mx-auto px-4 pt-8 pb-20"> {/* Increased bottom padding */}
          {children}
        </main>
        <ChatAiWidget /> 
        <Toaster />
        <footer className="w-full py-3 text-center text-xs text-primary-foreground fixed bottom-0 bg-primary z-50"> {/* Removed backdrop-blur-sm */}
          © Kelompok 6. Projek ini dibuat pada 11 Juni 2025.
        </footer>
      </body>
    </html>
  );
}
