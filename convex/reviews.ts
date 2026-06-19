import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Public submission. Stored as unapproved so it never shows up until you
// approve it (in the Convex dashboard, or via the optional admin function below).
export const submit = mutation({
  args: {
    name: v.string(),
    location: v.optional(v.string()),
    rating: v.number(),
    comment: v.string(),
    tour: v.optional(v.string()),
    language: v.optional(v.string()),
    // Honeypot: real users never fill this. Bots often do.
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Silently swallow obvious bot submissions (honeypot was filled).
    if (args.website && args.website.trim() !== "") {
      return { ok: true };
    }

    const name = args.name.trim().slice(0, 80);
    const comment = args.comment.trim().slice(0, 1000);
    const rating = Math.round(args.rating);

    if (!name) throw new Error("Please enter your name.");
    if (comment.length < 10) {
      throw new Error("Please write at least a few words about your experience.");
    }
    if (rating < 1 || rating > 5) {
      throw new Error("Please choose a rating from 1 to 5 stars.");
    }

    await ctx.db.insert("reviews", {
      name,
      location: args.location?.trim().slice(0, 80) || undefined,
      rating,
      comment,
      tour: args.tour?.trim().slice(0, 80) || undefined,
      language: args.language?.slice(0, 5) || undefined,
      approved: false, // hidden until approved
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

// Public read — only ever returns approved reviews, newest first.
export const listApproved = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 12, 50);
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .take(limit);

    // Return only the fields the page needs (no internal _id leakage needed).
    return rows.map((r) => ({
      name: r.name,
      location: r.location ?? null,
      rating: r.rating,
      comment: r.comment,
      tour: r.tour ?? null,
      createdAt: r.createdAt,
    }));
  },
});

// Aggregate rating — handy for the trust bar ("4.9 / 5 from 312 reviews").
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .collect();
    const count = rows.length;
    const average = count
      ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;
    return { count, average };
  },
});

// ---------------------------------------------------------------------------
// OPTIONAL admin approve/hide, gated by a secret you set in the Convex
// dashboard (Settings -> Environment Variables -> ADMIN_KEY).
// You can ignore this entirely and just toggle `approved` in the dashboard.
// ---------------------------------------------------------------------------
export const pending = query({
  args: { adminKey: v.string() },
  handler: async (ctx, args) => {
    if (args.adminKey !== process.env.ADMIN_KEY) throw new Error("Unauthorized");
    return await ctx.db
      .query("reviews")
      .withIndex("by_approved", (q) => q.eq("approved", false))
      .order("desc")
      .take(100);
  },
});

export const setApproved = mutation({
  args: { adminKey: v.string(), id: v.id("reviews"), approved: v.boolean() },
  handler: async (ctx, args) => {
    if (args.adminKey !== process.env.ADMIN_KEY) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { approved: args.approved });
    return { ok: true };
  },
});
