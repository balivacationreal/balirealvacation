import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Reviews / testimonials submitted by customers.
// Nothing is shown publicly until `approved` is set to true.
export default defineSchema({
  reviews: defineTable({
    name: v.string(),                 // display name
    location: v.optional(v.string()), // country / city (e.g. "Australia")
    rating: v.number(),               // 1 - 5
    comment: v.string(),              // the testimonial text
    tour: v.optional(v.string()),     // which tour package this is about
    language: v.optional(v.string()), // page language at submission (en/id/zh)
    approved: v.boolean(),            // moderation gate — false until you approve
    createdAt: v.number(),            // Date.now()
  })
    // lets us fetch approved reviews newest-first efficiently
    .index("by_approved", ["approved", "createdAt"]),
});
