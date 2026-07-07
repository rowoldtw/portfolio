import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { HomeSectionProvider } from '@/components/home-section-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from './footer'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
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
      document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#111' : '#ffffff';
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
        className={`${geist.variable} ${geistMono.variable} bg-white tracking-tight antialiased dark:bg-[#111]`}
      >
        <ThemeProvider>
          <HomeSectionProvider>
            <div className="hidden min-h-screen w-full bg-background font-(family-name:--font-inter-tight) md:block dark:bg-[#111]">
              {children}
            </div>
            <main className="flex min-h-dvh w-full items-center bg-white px-6 py-12 font-(family-name:--font-inter-tight) md:hidden dark:bg-[#111]">
              <section className="mx-auto max-w-sm">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Mobile preview unavailable
                </p>
                <h1 className="mt-3 text-2xl font-medium text-zinc-950 dark:text-zinc-50">
                  This site is being tested for desktop first.
                </h1>
                <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  Please visit from a tablet or desktop while the mobile layout
                  is being prepared.
                </p>
              </section>
            </main>
            <div className="hidden md:block">
              <Footer />
            </div>
          </HomeSectionProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
