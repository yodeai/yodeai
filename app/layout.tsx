import '@mantine/core/styles.css';
import "./globals.css";
import 'mantine-contextmenu/styles.css';
import '@mantine/tiptap/styles.css';

import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import HeadingBar from "@components/HeadingBar";

import { MantineProvider, ColorSchemeScript, Flex } from '@mantine/core';
import { ContextMenuProvider } from 'mantine-contextmenu';
import { ModalsProvider } from "@mantine/modals";

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
      <body>
        <MantineProvider defaultColorScheme="light">
          <ModalsProvider>
            <ContextMenuProvider>
              <header>
                <HeadingBar />
              </header>
              <Toaster />
              <Flex direction='column' w='100%' className="h-[calc(100%-60px)]">
                {children}
              </Flex>
            </ContextMenuProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html >
  );
}