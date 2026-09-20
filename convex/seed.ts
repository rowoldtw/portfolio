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
          brand: product.brand,
          image: product.image,
          alt: product.alt,
          url: product.url,
          published: true,
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
