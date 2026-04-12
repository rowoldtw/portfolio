import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { isWipModeEnabled } from '@/lib/wip-mode'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export function generateMetadata(): Metadata {
  const wipModeEnabled = isWipModeEnabled()

  return {
    metadataBase: new URL('https://woodrowrowoldt.com/'),
    alternates: {
      canonical: '/',
    },
    title: wipModeEnabled
      ? {
          default: 'Portfolio Refresh In Progress',
          template: '%s | Woodrow Rowoldt',
        }
      : {
          default: 'Woodrow Rowoldt',
          template: '%s | Woodrow Rowoldt',
        },
    description: wipModeEnabled
      ? 'The portfolio is temporarily offline while a new version is being prepared.'
      : 'Portfolio website for Woodrow Rowoldt.',
    robots: wipModeEnabled
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  }
}

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} bg-white tracking-tight antialiased dark:bg-[#121212]`}
      >
        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="system"
        >
          <div className="min-h-screen w-full font-(family-name:--font-inter-tight)">
            {children}
          </div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
