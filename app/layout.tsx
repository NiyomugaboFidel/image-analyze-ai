// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import ChatHeader from '@/components/ chart-header'
import { Sidebar } from './components/layout/Sidebar'
import { Toaster } from "sonner";
import { CameraProvider } from './context/CameraContextProvider'
 
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
  const userProfile = {
    name: 'John Doe',
    avatar: '/avatar.png',
    initials: 'JD',
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CameraProvider>
          <ChatHeader />
        
          <div className="flex h-screen bg-gray-50">
          <Sidebar userProfile={userProfile} />
          <main className="flex-1 overflow-auto p-4">
            {children}
            <Toaster richColors position="top-right" />
          </main>
        </div>
        </CameraProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}