import './globals.css'

export const metadata = {
  title: 'Ask questions about UC Berkeley',
  description: 'Created by the School of Information, contact: nsalehi@berkeley.edu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-background flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  )
}
