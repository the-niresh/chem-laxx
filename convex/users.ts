import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const getCurrentUser = query({
  handler: async (ctx) => {
    const user_id = await getAuthUserId(ctx);
    
    const user = user_id === null ? null : await ctx.db.get(user_id);
    return user;
  },
});

export const updateUserDetails = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user_id = await getAuthUserId(ctx);
    if (user_id === null) {
      throw new Error("Not authenticated");
    }

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.email !== undefined) patch.email = args.email;
    if (args.image !== undefined) patch.image = args.image;
    if (args.avatar_url !== undefined) patch.avatar_url = args.avatar_url;

    if (Object.keys(patch).length === 0) {
      return await ctx.db.get(user_id);
    }

    await ctx.db.patch(user_id, patch);
    return await ctx.db.get(user_id);
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user_id = await getAuthUserId(ctx);
    if (user_id === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveUserAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user_id = await getAuthUserId(ctx);
    if (user_id === null) {
      throw new Error("Not authenticated");
    }

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Failed to get uploaded file URL");
    }

    await ctx.db.patch(user_id, {
      image: args.storageId,
      avatar_url: url,
    });

    return await ctx.db.get(user_id);
  },
});