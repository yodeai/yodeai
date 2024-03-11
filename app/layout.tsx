import '@mantine/core/styles.css';
import "./globals.css";
import 'mantine-contextmenu/styles.css';

import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { ContextMenuProvider } from 'mantine-contextmenu';
import { ModalsProvider } from "@mantine/modals";
import AppLayout from '@components/Layout';
import { LensProvider } from '@contexts/context';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
  const supabase = createServerComponentClient({ cookies });
  const user = await supabase.auth.getUser();

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
              <LensProvider initialState={{ user: user?.data?.user }}>
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