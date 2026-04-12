# Portfolio

This is my portfolio website to showcase work I've done.

## Work In Progress Mode

Set `NEXT_PUBLIC_PORTFOLIO_WIP_MODE=true` to deploy the temporary placeholder instead of the main site.

When the flag is enabled:

- `/` renders the maintenance page.
- Other app routes redirect back to `/`.
- Metadata and `robots.txt` switch to `noindex`.

Unset the variable or set it to `false` to restore the full portfolio.
