// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "sonner";
import { AuthProvider } from './context/AuthoContext'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VICKY AI || VIDEO AND IMAGE ANALYSIS',
  // icons: {
  //   icon: './favicon.ico',
  //   shortcut: './favicon.ico',
  //   apple: './favicon.ico',
  // },
  description: 'AI-powered BY VICKY',
  keywords: 'AI, VICKY, image analysis, video analysis',
  authors: [{ name: 'VICKY AI' }],
  creator: 'VICKY ',
  publisher: 'VICKY',
  openGraph: {
    title: 'VICKY AI || VIDEO AND IMAGE ANALYSIS',
    description: 'AI-powered BY VICKY',
    url: 'https://vicky-ai.vercel.app',
    siteName: 'VICKY AI',
    images: [
      {
        url: '/next.svg',
        width: 1200,
        height: 630,
        alt: 'VICKY AI || VIDEO AND IMAGE ANALYSIS',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>


     
       
        
          <main>
            {children}
            <Toaster richColors position="top-right" />
          </main>
    
  
        </AuthProvider>
        </ThemeProvider>
  
      </body>
    </html>
  )
}