import "./globals.css";
import '@mantine/core/styles.css';

import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import HeadingBar from "@components/HeadingBar";

import { MantineProvider, ColorSchemeScript, MantineThemeProvider } from '@mantine/core';
import { AppShell, Burger, Group, Skeleton } from '@mantine/core';

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Yodeai",
  description: "Created at the UC, Berkeley School of Information",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {



  return (
    <html lang="en" >
      <head>
        <link rel="icon" href="/yodeai.png" />
        <ColorSchemeScript />
      </head>
      <body
      // className="flex flex-col py-2 min-h-screen font-sans bg-[#fffefc] text-[#1a202c]"
      >
        <MantineProvider>
          <header style={{ borderWidth: 20, borderBottomColor: 'pink' }}  >
            <HeadingBar />
          </header>
          <Toaster />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}