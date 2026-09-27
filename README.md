# Woodrow Rowoldt portfolio

A personal portfolio built with Next.js App Router, React, Tailwind CSS, MDX, Motion, and Convex. Vercel Analytics and Speed Insights are included in the root layout.

## Development

```bash
pnpm install
pnpm dev
```

The site can run without Convex, but `/reviews` displays an unavailable message until `NEXT_PUBLIC_CONVEX_URL` is configured. For the review catalog, run `pnpm exec convex dev` in another terminal and follow [the Convex setup guide](convex/README.md) to seed data. Convex writes local settings to the ignored `.env.local` file.

## Checks

```bash
pnpm lint
pnpm build
```

## Site structure

- `/` is a single landing section with a footer revealed by scrolling.
- `/projects` currently shows placeholder previews for Amarula, Rooibos, and Muta.
- `/reviews` displays Convex-backed hardware and software cards plus a full-screen album art gallery with drag, trackpad, and keyboard navigation and album and artist captions. Software cards show their category without a platform badge. Album artwork fades in when ready and softly fades into the page background at all four edges, without a separate preloader.
- `/blog/01-01-26`, `/blog/02-01-26`, and `/blog/03-01-26` are MDX posts.
- `/personal` redirects to `/reviews`; `/gallery` redirects to `/projects`.

The persistent bottom navigation includes theme switching, static page previews from `public/previews/`, and a command menu opened by its button or Command/Ctrl+K. Commands leave the menu open, and its footer describes the selected option. Refresh the preview snapshots when the page layouts change. The inset page frame and navbar frame enter together on non-review pages, including after refresh. Theme choice persists locally, and the first-visit preloader can be replayed from the command menu. Shared profile, post, and social data lives in `app/data.ts`; review content lives in Convex.
