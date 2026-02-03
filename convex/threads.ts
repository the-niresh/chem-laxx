import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createThread = mutation({
  args: {
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const threadId = await ctx.db.insert("threads", {
      userId: args.user_id,
      title: "New Conversation",
      messages: [],
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    console.log("Created thread with id:", threadId);
    return threadId;
  },
});

export const checkThreadExists = query({
  args: {
    thread_id: v.any(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    try {
      const thread = await ctx.db.get(args.thread_id);
      return thread !== null;
    } catch (error) {
      console.error("Error checking if thread exists:", error);
      return false;
    }
  },
});

export const get = query({
  args: { id: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listThreadsByUser = query({
  args: {
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threads")
      .withIndex("by_user_id", (q) => q.eq("userId", args.user_id))
      .order("desc")
      .collect();
  },
});
