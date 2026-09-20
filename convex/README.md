# Portfolio reviews

Reviews are stored in Convex, with public read-only queries and internal authoring functions. The frontend subscribes to the active collection; changing a published review updates open pages automatically.

## Development

1. `pnpm install`
2. `pnpm exec convex dev` (sync backend changes)
3. `pnpm dev` in another terminal, unless the website server is already running.

Convex writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to the ignored `.env.local`. Use `pnpm exec convex dev --once` for a one-time backend push. Generated files in `_generated/` are committed; do not edit them manually.

## Existing content

Run `pnpm exec convex run seed:reviews` once per deployment. It imports the 39 catalog items from `seedData.ts`. Running it again skips existing slugs and does not overwrite review text or other edits. The seed is migration data, not a frontend fallback; update Convex for ongoing changes.

## Add or edit a review

Use the Convex dashboard's Data tab (`reviews`) or run the internal `manageReviews:save` function from the dashboard/CLI. CLI example:

```sh
pnpm exec convex run manageReviews:save '{"slug":"example-app","collection":"software","name":"Example App","category":"Editor","brand":"Example","image":"/reviews/example.webp","alt":"Example App icon","url":"https://example.com","review":"My review text.","published":false,"accessory":false,"sortOrder":20}'
```

`save` replaces the complete document with the same slug, or inserts a new one. Include all fields you want to retain. Keep slugs unique. Optional `review` holds plain text with paragraph breaks; missing/blank text displays the current placeholder. `published: false` hides the entire item from visitors. `accessory` controls the hardware subsection. `sortOrder` is ascending for hardware/software. Albums use a numeric `releaseDate` (UTC Unix milliseconds), newest first. The internal save function requires an album release date.

For existing images, use paths under `/public`, such as `/reviews/wooting-60he.webp`. New images must be added to `/public/reviews/` and deployed with the site, or use a trusted HTTPS image URL. The current cards use standard image elements. Images are not uploaded to Convex storage by this integration.

`manageReviews:remove` deletes one item by slug and is also internal. There are no public write functions or visitor accounts. Dashboard and CLI access require your Convex account/deployment credentials. Do not expose deploy keys to the browser.

The UI initially loads 48 items per collection, then offers Load more. The single count is exact when all items are loaded; `48+` means more are available. Queries use indexes and pagination rather than scanning every review.

## Production

The initial setup uses a cloud **development** deployment. Production is separate and is not automatically seeded or configured.

Set a production `CONVEX_DEPLOY_KEY` in the hosting provider's server/build environment and use `pnpm exec convex deploy --cmd 'pnpm build'` as the build command. Convex supplies the production `NEXT_PUBLIC_CONVEX_URL` during that build. Alternatively, deploy Convex first and configure the matching public URL in the website environment before building. Never prefix the deploy key with `NEXT_PUBLIC_`.

After deploying the backend, run `pnpm exec convex run --prod seed:reviews` deliberately to import the initial items into production. Development edits do not automatically copy into production.

## Verification

`pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, and `pnpm exec convex dev --once` check frontend/backend types and deployment. Verify all three collections, expanded review text, draft exclusion, pagination, and live updates before publishing.
