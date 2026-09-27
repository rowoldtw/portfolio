import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const collectionValidator = v.union(
  v.literal('hardware'),
  v.literal('software'),
  v.literal('albums'),
)

export const reviewFields = {
  slug: v.string(),
  collection: collectionValidator,
  name: v.string(),
  category: v.string(),
  platform: v.optional(
    v.union(v.literal('desktop'), v.literal('mobile'), v.literal('both')),
  ),
  brand: v.string(),
  image: v.string(),
  alt: v.string(),
  url: v.string(),
  review: v.optional(v.string()),
  currentlyUsing: v.optional(v.boolean()),
  published: v.boolean(),
  accessory: v.boolean(),
  sortOrder: v.number(),
  releaseDate: v.optional(v.number()),
}

export default defineSchema({
  reviews: defineTable(reviewFields)
    .index('by_slug', ['slug'])
    .index('by_collection_and_published_and_sortOrder', [
      'collection',
      'published',
      'sortOrder',
    ])
    .index('by_collection_and_published_and_releaseDate', [
      'collection',
      'published',
      'releaseDate',
    ]),
})
