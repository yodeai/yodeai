import "./globals.css";

import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import HeadingBar from "@components/HeadingBar";


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
      </head>
      <body
        
      className="flex flex-col py-2 min-h-screen font-sans bg-[#fffefc] text-[#1a202c]"
      >
        <header>
          <HeadingBar />
        </header>
        <Toaster />
        {children}
        
      </body>
    </html>
  );
}