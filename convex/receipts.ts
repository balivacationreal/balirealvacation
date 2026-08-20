import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Booking receipts / itineraries issued from /booking-receipt.html.
//
// The document itself is a blob of JSON the page knows how to render; Convex
// only stores it against a short public id so the guest link can be a handful
// of characters instead of a kilobyte of encoded booking in the URL.

const MAX_DATA = 20000; // a very full booking is ~2KB; this is a generous ceiling

// Unambiguous alphabet: no O/0, I/l/1 — these ids get read aloud and retyped.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
function newId() {
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

// Optional shared secret. Set RECEIPT_KEY in the Convex dashboard to lock
// issuing down to whoever has the key; leave it unset and issuing stays open.
// Reading is always public — that is the whole point of a guest link.
function checkKey(key: string | undefined) {
  const expected = process.env.RECEIPT_KEY;
  if (!expected) return;
  if (key !== expected) {
    throw new Error("This copy of the receipt tool is not authorised to issue receipts.");
  }
}

// Create or update a receipt. Pass the rid you were given last time to update
// that same record, so re-sharing an edited booking keeps one stable link.
export const save = mutation({
  args: {
    rid: v.optional(v.string()),
    data: v.string(),
    no: v.optional(v.string()),
    guest: v.optional(v.string()),
    key: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    checkKey(args.key);

    if (!args.data || args.data.length > MAX_DATA) {
      throw new Error("That booking is too large to store.");
    }
    const fields = {
      data: args.data,
      no: args.no?.slice(0, 60) || undefined,
      guest: args.guest?.slice(0, 120) || undefined,
      updatedAt: Date.now(),
    };

    if (args.rid) {
      const existing = await ctx.db
        .query("receipts")
        .withIndex("by_rid", (q) => q.eq("rid", args.rid!))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, fields);
        return { rid: existing.rid };
      }
    }

    // Fresh id, retried on the (vanishingly unlikely) collision.
    let rid = newId();
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await ctx.db
        .query("receipts")
        .withIndex("by_rid", (q) => q.eq("rid", rid))
        .unique();
      if (!clash) break;
      rid = newId();
    }

    await ctx.db.insert("receipts", { rid, createdAt: Date.now(), ...fields });
    return { rid };
  },
});

// Public read: this is what a guest's link resolves through.
export const get = query({
  args: { rid: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("receipts")
      .withIndex("by_rid", (q) => q.eq("rid", args.rid))
      .unique();
    return doc ? { data: doc.data } : null;
  },
});

// Everything issued, newest first — lets the tool list past bookings on any
// device instead of only the browser they were created in.
export const recent = query({
  args: { limit: v.optional(v.number()), key: v.optional(v.string()) },
  handler: async (ctx, args) => {
    checkKey(args.key);
    const limit = Math.min(Math.max(args.limit ?? 40, 1), 100);
    const docs = await ctx.db.query("receipts").order("desc").take(limit);
    return docs.map((d) => ({
      rid: d.rid,
      no: d.no,
      guest: d.guest,
      updatedAt: d.updatedAt,
    }));
  },
});

// Admin-only housekeeping. internalMutation means this is NOT reachable from a
// browser — it can only be run by you, from the CLI or the dashboard:
//   npx convex run receipts:purge '{"rids":["abc123def4"]}'
export const purge = internalMutation({
  args: {
    rids: v.optional(v.array(v.string())),
    noPrefix: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("receipts").collect();
    const removed: string[] = [];
    for (const doc of all) {
      const byRid = args.rids ? args.rids.includes(doc.rid) : false;
      const byPrefix = args.noPrefix ? (doc.no ?? "").startsWith(args.noPrefix) : false;
      if (byRid || byPrefix) {
        await ctx.db.delete(doc._id);
        removed.push(doc.rid);
      }
    }
    return { removed, remaining: all.length - removed.length };
  },
});
