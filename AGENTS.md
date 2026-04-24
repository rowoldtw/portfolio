# Agent Guide

## Commands

- Install dependencies with `pnpm install`.
- Run local development with `pnpm dev`.
- Verify production output with `pnpm build`.

## Working Rules

- Keep changes small and aligned with the existing minimal portfolio style.
- Do not overwrite user edits or unrelated work.
- Prefer existing components, data structures, and Tailwind patterns.
- Keep comments rare; add them only when the code is not self-explanatory.
- Run `pnpm build` before handing off changes that affect app code, config, or dependencies.

## Notes

- `NEXT_PUBLIC_PORTFOLIO_WIP_MODE=true` enables the temporary maintenance page.
- Root homepage sections are scroll-snapped; avoid transforms on the snapping section elements themselves.
