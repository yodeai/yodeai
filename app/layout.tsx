import "./globals.css";
import { Inter } from "next/font/google";
import clsx from "clsx";
import { Toaster } from "react-hot-toast";

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
    <html lang="en" className="h-full">
      <body
        className={clsx(
          inter.className,
          "bg-[#fffefc] text-[#1a202c] font-sans antialiased flex items-stretch h-full"
        )}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}