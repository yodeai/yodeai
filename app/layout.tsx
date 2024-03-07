import '@mantine/core/styles.css';
import "./globals.css";
import 'mantine-contextmenu/styles.css';

import { Inter } from "next/font/google";

import { MantineProvider, ColorSchemeScript, Flex, AppShellHeader, AppShell } from '@mantine/core';
import { ContextMenuProvider } from 'mantine-contextmenu';
import { ModalsProvider } from "@mantine/modals";
import AppLayout from '@components/Layout';
import { LensProvider } from '@contexts/context';

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
              <LensProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </LensProvider>
            </ContextMenuProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html >
  );
}