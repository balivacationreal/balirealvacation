import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Guest gallery photos, shown on /guest-gallery.html and added from
// /gallery-upload.html.
//
// Each photo is two files in Convex file storage — a small thumbnail for the
// grid and a larger copy for the full-screen view — plus a row here that says
// who the driver was, which tour it was, and whether it may be shown.
// Like reviews, nothing is public until `approved` is true.

// Most rows one page load may ask for. The gallery reveals them in steps, so
// this is a ceiling on the list, not on what a visitor downloads.
const MAX_LIST = 500;

// The upload page shrinks every photo before sending it, so anything bigger
// than this did not come from that page.
const MAX_FULL_BYTES = 2_000_000;
const MAX_THUMB_BYTES = 300_000;

// How many photos one driver may have waiting for approval at once.
const MAX_PENDING = 60;

// ---------------------------------------------------------------------------
// Who is asking. Everything that changes the gallery takes an access code:
//
//   ADMIN_KEY     the owner's key (already used by the review admin functions).
//                 May upload for any driver, approve, hide and delete anything.
//   DRIVER_CODES  one personal code per driver, as "slug:code" pairs separated
//                 by commas, e.g.  putu-ardi:k7m2xq9wpd,ketut-widiasa:r4t8…
//                 A driver may upload their own photos and delete their own.
//                 Their uploads stay hidden until an admin approves them.
//
// Both are environment variables (Convex dashboard → Settings → Environment
// Variables). To lock one driver out, change or remove their pair there; no
// redeploy is needed. Codes shorter than 8 characters are ignored.
// ---------------------------------------------------------------------------
type Who = { role: "admin" } | { role: "driver"; driver: string };

function identify(code: string): Who | null {
  if (!code || code.length < 8) return null;
  const admin = process.env.ADMIN_KEY;
  if (admin && code === admin) return { role: "admin" };
  for (const pair of (process.env.DRIVER_CODES ?? "").split(",")) {
    const at = pair.indexOf(":");
    if (at < 1) continue;
    const slug = pair.slice(0, at).trim();
    if (slug && pair.slice(at + 1).trim() === code) return { role: "driver", driver: slug };
  }
  return null;
}

// Expected refusals are returned as { ok: false, reason } rather than thrown:
// a production deployment hides thrown messages from the browser, and the
// upload page needs to tell a driver what went wrong.
const refuse = (reason: string) => ({ ok: false as const, reason });

// Public read — only ever returns approved photos, newest first.
export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("photos")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .take(MAX_LIST);

    const out = await Promise.all(
      rows.map(async (r) => {
        const [thumb, full] = await Promise.all([
          ctx.storage.getUrl(r.thumbId),
          ctx.storage.getUrl(r.fullId),
        ]);
        // A row whose file has been deleted from storage is skipped rather
        // than shown as a broken tile.
        if (!thumb || !full) return null;
        return {
          thumb,
          full,
          width: r.width,
          height: r.height,
          driver: r.driver,
          tour: r.tour ?? null,
          caption: r.caption ?? null,
          createdAt: r.createdAt,
        };
      }),
    );
    return out.filter((p) => p !== null);
  },
});

// Signing in on the upload page: says whose code this is, or null.
export const whoami = query({
  args: { code: v.string() },
  handler: async (_ctx, args) => identify(args.code),
});

// The signed-in person's photos, approved or not, newest first.
// A driver sees their own; an admin sees everyone's.
export const mine = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const who = identify(args.code);
    if (!who) return null;
    const rows =
      who.role === "admin"
        ? await ctx.db.query("photos").order("desc").take(300)
        : await ctx.db
            .query("photos")
            .withIndex("by_driver", (q) => q.eq("driver", who.driver))
            .order("desc")
            .take(100);
    return await Promise.all(
      rows.map(async (r) => ({
        id: r._id,
        thumb: await ctx.storage.getUrl(r.thumbId),
        driver: r.driver,
        tour: r.tour ?? null,
        caption: r.caption ?? null,
        approved: r.approved,
        createdAt: r.createdAt,
      })),
    );
  },
});

// Adding a photo is three steps, twice over for the two sizes:
//   1. uploadUrl      → a one-time address to POST the file to
//   2. POST the file  → Convex answers with a storageId
//   3. add            → records the two storageIds with the photo's details
export const uploadUrl = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    if (!identify(args.code)) return refuse("bad_code");
    return { ok: true as const, url: await ctx.storage.generateUploadUrl() };
  },
});

export const add = mutation({
  args: {
    code: v.string(),
    thumbId: v.id("_storage"),
    fullId: v.id("_storage"),
    width: v.number(),
    height: v.number(),
    // Only an admin chooses the driver; a driver's own code decides theirs.
    driver: v.optional(v.string()),
    tour: v.optional(v.string()),
    caption: v.optional(v.string()),
    // The guests in the photo agreed to it being published. Required: a photo
    // cannot be recorded without it.
    consent: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Whatever goes wrong from here, the two files must not be left behind.
    const [thumb, full] = await Promise.all([
      ctx.db.system.get(args.thumbId),
      ctx.db.system.get(args.fullId),
    ]);
    const discard = async (reason: string) => {
      if (thumb) await ctx.storage.delete(args.thumbId);
      if (full) await ctx.storage.delete(args.fullId);
      return refuse(reason);
    };

    const who = identify(args.code);
    if (!who) return await discard("bad_code");
    if (!args.consent) return await discard("no_consent");

    const driver =
      who.role === "driver" ? who.driver : (args.driver ?? "").trim().slice(0, 40);
    if (!driver) return await discard("no_driver");

    const isImage = (f: { contentType?: string } | null) =>
      !!f && (f.contentType ?? "").startsWith("image/");
    if (
      !thumb || !full || !isImage(thumb) || !isImage(full) ||
      thumb.size > MAX_THUMB_BYTES || full.size > MAX_FULL_BYTES
    ) {
      return await discard("bad_file");
    }

    if (who.role === "driver") {
      const theirs = await ctx.db
        .query("photos")
        .withIndex("by_driver", (q) => q.eq("driver", driver))
        .order("desc")
        .take(200);
      if (theirs.filter((r) => !r.approved).length >= MAX_PENDING) {
        return await discard("too_many_pending");
      }
    }

    await ctx.db.insert("photos", {
      thumbId: args.thumbId,
      fullId: args.fullId,
      width: Math.round(args.width),
      height: Math.round(args.height),
      driver,
      tour: args.tour?.trim().slice(0, 80) || undefined,
      caption: args.caption?.trim().slice(0, 200) || undefined,
      consent: true,
      // An admin's own upload needs nobody else's approval.
      approved: who.role === "admin",
      createdAt: Date.now(),
    });
    return { ok: true as const, approved: who.role === "admin" };
  },
});

// Publish or hide a photo. Admin only.
export const setApproved = mutation({
  args: { code: v.string(), id: v.id("photos"), approved: v.boolean() },
  handler: async (ctx, args) => {
    const who = identify(args.code);
    if (!who) return refuse("bad_code");
    if (who.role !== "admin") return refuse("not_allowed");
    await ctx.db.patch(args.id, { approved: args.approved });
    return { ok: true as const };
  },
});

// Takes a photo down for good: the row and both files. This is what a guest's
// removal request should use — hiding alone leaves the files in storage.
// An admin may delete any photo; a driver only their own.
export const remove = mutation({
  args: { code: v.string(), id: v.id("photos") },
  handler: async (ctx, args) => {
    const who = identify(args.code);
    if (!who) return refuse("bad_code");
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: true as const };
    if (who.role === "driver" && row.driver !== who.driver) return refuse("not_allowed");
    await ctx.storage.delete(row.thumbId);
    await ctx.storage.delete(row.fullId);
    await ctx.db.delete(args.id);
    return { ok: true as const };
  },
});
