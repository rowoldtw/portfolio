import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { reviewFields } from './schema'

// Dashboard/CLI only; these functions are not callable by site visitors.
export const save = internalMutation({
  args: reviewFields,
  returns: v.id('reviews'),
  handler: async (ctx, review) => {
    if (!review.slug.trim() || !review.name.trim())
      throw new Error('Slug and name are required.')
    if (!/^https?:\/\//.test(review.url))
      throw new Error('Use an HTTP or HTTPS product link.')
    if (review.collection === 'albums' && review.releaseDate === undefined)
      throw new Error('Albums require a release date.')
    const existing = await ctx.db
      .query('reviews')
      .withIndex('by_slug', (q) => q.eq('slug', review.slug))
      .unique()
    if (existing) {
      await ctx.db.replace(existing._id, review)
      return existing._id
    }
    return await ctx.db.insert('reviews', review)
  },
})

export const remove = internalMutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, { slug }) => {
    const existing = await ctx.db
      .query('reviews')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
    if (existing) await ctx.db.delete(existing._id)
    return null
  },
})
