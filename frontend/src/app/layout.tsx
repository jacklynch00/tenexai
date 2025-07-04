'use client'

import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && error.message.includes('400')) {
            return false
          }
          return failureCount < 3
        },
      },
      mutations: {
        retry: false,
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <title>Automate This Job - AI-Powered Job Automation Analysis</title>
        <meta name="description" content="Discover AI automation opportunities for any job with detailed ROI analysis. Get comprehensive automation recommendations and implementation roadmaps in minutes." />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content="Automate This Job - AI-Powered Job Automation Analysis" />
        <meta property="og:description" content="Discover AI automation opportunities for any job with detailed ROI analysis. Get comprehensive automation recommendations and implementation roadmaps in minutes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automate-this-job.com" />
        <meta property="og:image" content="/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Automate This Job - AI-Powered Job Automation Analysis" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Automate This Job - AI-Powered Job Automation Analysis" />
        <meta name="twitter:description" content="Discover AI automation opportunities for any job with detailed ROI analysis." />
        <meta name="twitter:image" content="/og-image.svg" />
        
        {/* Additional meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Automate This Job" />
        <meta name="keywords" content="AI automation, job analysis, ROI calculation, process automation, workflow optimization, productivity tools" />
        
        <link rel="canonical" href="https://automate-this-job.com" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </body>
    </html>
  )
}