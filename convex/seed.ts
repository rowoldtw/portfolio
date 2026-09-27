import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { hardwareProducts, softwareProducts, albums } from './seedData'

export const reviews = internalMutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    let inserted = 0
    let skipped = 0
    for (const [collection, products] of [
      ['hardware', hardwareProducts],
      ['software', softwareProducts],
      ['albums', albums],
    ] as const) {
      for (const [sortOrder, product] of products.entries()) {
        const existing = await ctx.db
          .query('reviews')
          .withIndex('by_slug', (q) => q.eq('slug', product.id))
          .unique()
        if (existing) {
          if (collection === 'software' && 'platform' in product) {
            const imageChanged =
              existing.image !== product.image || existing.alt !== product.alt
            const publicationChanged =
              'published' in product && product.published !== existing.published
            if (
              existing.platform !== product.platform ||
              imageChanged ||
              publicationChanged
            ) {
              await ctx.db.patch(existing._id, {
                ...(existing.platform !== product.platform
                  ? { platform: product.platform }
                  : {}),
                ...(imageChanged
                  ? { image: product.image, alt: product.alt }
                  : {}),
                ...(publicationChanged ? { published: product.published } : {}),
              })
            }
          }
          skipped++
          continue
        }
        const released = product.details.find(
          ([key]) => key === 'Released',
        )?.[1]
        await ctx.db.insert('reviews', {
          slug: product.id,
          collection,
          name: product.name,
          category: product.category,
          ...('platform' in product ? { platform: product.platform } : {}),
          brand: product.brand,
          image: product.image,
          alt: product.alt,
          url: product.url,
          published: !('published' in product && product.published === false),
          accessory: [
            'Mousepad',
            'Phone case',
            'Laptop skin',
            'Wallet',
          ].includes(product.category),
          sortOrder,
          ...(released
            ? { releaseDate: Date.parse(`${released} 00:00:00 GMT`) }
            : {}),
        })
        inserted++
      }
    }
    return { inserted, skipped }
  },
})
