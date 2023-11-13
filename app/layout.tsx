// import "./globals.css";
import '@mantine/core/styles.css';

import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import HeadingBar from "@components/HeadingBar";

import { MantineProvider, ColorSchemeScript, Flex } from '@mantine/core';

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
        <MantineProvider defaultColorScheme="light">
          <header>
            <Flex align={"flex-start"} justify={"flex-start"} direction={"column"} style={{ zIndex: 290, width: '100%', position: 'fixed', top: 0, height: '60px', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <HeadingBar />
            </Flex>
          </header>
          <Toaster />
          <Flex direction={'column'} w={'100%'} mt={50}>
            {children}
          </Flex>
        </MantineProvider>
      </body>
    </html>
  );
}