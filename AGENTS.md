# Agent Guide

## Commands

- Install dependencies with `pnpm install`.
- Run the site with `pnpm dev`.
- Check formatting and code rules with `pnpm lint`.
- Verify production output with `pnpm build` after changes to app code, configuration, or dependencies.
- For local review data, run `pnpm exec convex dev` alongside the site. See `convex/README.md` for setup, seeding, and deployment.

## Repository map

- `app/page.tsx` renders the landing page in `app/home-page.tsx`. It has one main section and a separate footer revealed by normal scrolling; it does not use section scroll snapping.
- `app/projects/page.tsx` shows placeholder project previews. `app/reviews/page.tsx` loads the hardware, software, and albums catalog from Convex. `components/album-gallery.tsx` presents album covers in a full-viewport art gallery with drag, trackpad, and keyboard navigation plus album and artist captions. The artwork fades in when ready, with a subtle four-sided edge fade and no separate preloader. Missing Convex configuration shows an unavailable state.
- `app/blog/**/page.mdx` contains blog posts. `/personal` redirects to `/reviews`, and `/gallery` redirects to `/projects`.
- `app/layout.tsx` owns the persistent frame, providers, preloader, cursor, and bottom navigation. `app/template.tsx` owns the route content entrance fade. `app/globals.css` brings the page and navbar frames into view together on non-review routes.
- `app/footer.tsx` owns the bottom navigation and command menu trigger. `components/ui/page-preview-tooltip.tsx` renders the static light and dark page snapshots in `public/previews/`. `components/ui/skiper-command-menu.tsx` owns the menu's visual treatment and entrance and exit motion. Theme changes from the menu and toggle share the same view transition.
- Shared profile, post, and social data lives in `app/data.ts`. Review records live in Convex; do not edit `convex/_generated` by hand.

## Working rules

- Keep changes small and aligned with `DESIGN.md` and the existing minimal portfolio style.
- Do not overwrite user edits or unrelated work. Prefer existing components, data structures, and Tailwind patterns.
- Keep comments rare; add them only when the code is not self-explanatory.
- Preserve keyboard, touch, and reduced-motion behavior when editing interactions.
- Animate the persistent page frame rather than route content when changing its visibility. Animate children of any scroll snap container rather than the snapping section.
- Use `ctx7` for current documentation when a task asks about a library, framework, SDK, API, CLI, or cloud service. Resolve the library before fetching its docs.
- Use `agent-browser` for browser automation, starting with `agent-browser --help` when its commands are needed.
