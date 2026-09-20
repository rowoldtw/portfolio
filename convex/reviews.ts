import {
  paginationOptsValidator,
  paginationResultValidator,
} from 'convex/server'
import { v } from 'convex/values'
import { query } from './_generated/server'
import { collectionValidator, reviewFields } from './schema'

// Published portfolio content is intentionally readable without signing in.
export const list = query({
  args: {
    collection: collectionValidator,
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(
    v.object({
      ...reviewFields,
      _id: v.id('reviews'),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, { collection, paginationOpts }) => {
    const query =
      collection === 'albums'
        ? ctx.db
            .query('reviews')
            .withIndex('by_collection_and_published_and_releaseDate', (q) =>
              q.eq('collection', collection).eq('published', true),
            )
            .order('desc')
        : ctx.db
            .query('reviews')
            .withIndex('by_collection_and_published_and_sortOrder', (q) =>
              q.eq('collection', collection).eq('published', true),
            )
            .order('asc')
    return await query.paginate({
      ...paginationOpts,
      numItems: Math.min(paginationOpts.numItems, 48),
    })
  },
})
