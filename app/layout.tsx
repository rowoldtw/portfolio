import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/theme-provider'
import { UiPreferencesProvider } from '@/components/ui-preferences-provider'
import { SitePreloader } from '@/components/site-preloader'
import { ReviewCollectionProvider } from '@/components/review-collection-provider'
import { Footer } from './footer'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { DitherCursor } from '@/components/ui/dither-cursor'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#111' },
  ],
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://woodrowrowoldt.com/'),
    alternates: {
      canonical: '/',
    },
    title: {
      default: 'Woodrow Rowoldt',
      template: '%s | Woodrow Rowoldt',
    },
    description: 'Portfolio website for Woodrow Rowoldt.',
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

const themeInitScript = `
  (() => {
    try {
      const storedTheme = window.localStorage.getItem('theme');
      const theme =
        storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system'
          ? storedTheme
          : 'system';
      const resolvedTheme =
        theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;

      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
      document.documentElement.classList.toggle('light', resolvedTheme === 'light');
      document.documentElement.dataset.themeChoice = theme;
      document.documentElement.dataset.themeReady = 'false';
      const hasSeenIntroPreloader =
        window.localStorage.getItem('portfolio:intro-preloader-seen') === 'true';
      document.documentElement.dataset.showIntroPreloader =
        !hasSeenIntroPreloader ? 'true' : 'false';
      document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#111' : '#fafafa';
      document.documentElement.style.colorScheme = resolvedTheme;
    } catch {}
  })();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} bg-background tracking-tight antialiased dark:bg-[#111]`}
      >
        <ThemeProvider>
          <DitherCursor />
          <CustomCursor />
          <UiPreferencesProvider>
            <ReviewCollectionProvider>
              <SitePreloader />
              <div
                data-site-content=""
                className="bg-background min-h-screen w-full font-(family-name:--font-inter-tight) dark:bg-[#111]"
              >
                {children}
              </div>
              <div data-site-content="">
                <Footer />
              </div>
            </ReviewCollectionProvider>
          </UiPreferencesProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
