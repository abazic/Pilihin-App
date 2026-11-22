import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Raleway } from "next/font/google";
import PublicPageAnimations from "@/components/PublicPageAnimations";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Import Font Serif untuk logo & heading estetik
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "inStories creative",
  description: "Creative photography and visual storytelling by inStories creative.",
  icons: {
    icon: "/instories.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${raleway.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f6f6f6] dark:bg-[#0f0f0f] font-sans text-stone-800 dark:text-stone-200">
        <PublicPageAnimations />
        {children}
      </body>
    </html>
  );
}
