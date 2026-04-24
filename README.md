# Portfolio

Personal portfolio built with Next.js, MDX, Tailwind CSS, Motion, and Vercel.

## Development

Install dependencies:

```bash
pnpm install
```

Start the local dev server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

## Work-In-Progress Mode

Set `NEXT_PUBLIC_PORTFOLIO_WIP_MODE=true` to deploy the temporary placeholder instead of the main site.

When enabled:

- `/` renders the maintenance page.
- Other app routes redirect back to `/`.
- Metadata and `robots.txt` switch to `noindex`.

Unset the variable or set it to `false` to restore the full portfolio.

## Project Notes

- Homepage sections use CSS scroll snap with a custom section navigator.
- Blog posts live in `app/blog/**/page.mdx`.
- Shared profile, project, post, and social data lives in `app/data.ts`.
