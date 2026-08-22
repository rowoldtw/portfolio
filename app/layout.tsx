import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { HomeSectionProvider } from '@/components/home-section-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { UiPreferencesProvider } from '@/components/ui-preferences-provider'
import { PersistentSectionNav } from '@/components/persistent-section-nav'
import { SitePreloader } from '@/components/site-preloader'
import { Footer } from './footer'

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
      const homeSectionIds = ['home', 'projects', 'experience', 'skills', 'connect'];
      const hashSectionId = window.location.hash.replace('#', '');
      const storedHomeSectionId = window.sessionStorage.getItem('portfolio:home:last-section-id');
      const initialHomeSectionId = homeSectionIds.includes(hashSectionId)
        ? hashSectionId
        : homeSectionIds.includes(storedHomeSectionId)
          ? storedHomeSectionId
          : 'home';
      document.documentElement.dataset.initialHomeSectionId = initialHomeSectionId;
      document.documentElement.style.setProperty(
        '--initial-home-section-index',
        String(homeSectionIds.indexOf(initialHomeSectionId)),
      );
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
          <UiPreferencesProvider>
            <SitePreloader />
            <HomeSectionProvider>
              <div className="bg-background min-h-screen w-full font-(family-name:--font-inter-tight) dark:bg-[#111]">
                {children}
              </div>
              <div>
                <PersistentSectionNav />
                <Footer />
              </div>
            </HomeSectionProvider>
          </UiPreferencesProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
