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

  // Booking receipts issued from /booking-receipt.html. `data` is the rendered
  // document's own JSON; Convex just holds it against a short id so guest links
  // stay short. See convex/receipts.ts.
  receipts: defineTable({
    rid: v.string(),                  // short public id used in the guest link
    data: v.string(),                 // packed booking JSON
    no: v.optional(v.string()),       // document number, e.g. BRV-20260820-001
    guest: v.optional(v.string()),    // guest name, for listing past bookings
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_rid", ["rid"]),
});
