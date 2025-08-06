import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MindCare - Mental Health Support Platform',
  description: 'A comprehensive mental health platform connecting patients with doctors through AI-powered chat assessment',
  keywords: 'mental health, therapy, counseling, AI chat, support, wellness',
  authors: [{ name: 'MindCare Team' }],
  openGraph: {
    title: 'MindCare - Mental Health Support Platform',
    description: 'Transform your mental health journey with personalized support and professional care.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
          <Footer />
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  )
} 