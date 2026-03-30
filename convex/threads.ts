import { OpenAI } from "openai";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export const createThread = mutation({
  args: {
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || userId !== args.user_id) throw new Error("Unauthorized");

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
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    try {
      const thread = await ctx.db.get(args.thread_id);
      return thread !== null && thread.userId === userId;
    } catch (error) {
      console.error("Error checking if thread exists:", error);
      return false;
    }
  },
});

export const get = query({
  args: { id: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const thread = await ctx.db.get(args.id);
    if (!thread || thread.userId !== userId) throw new Error("Unauthorized");
    return thread;
  },
});

export const listThreadsByUser = query({
  args: {
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || userId !== args.user_id) throw new Error("Unauthorized");

    return await ctx.db
      .query("threads")
      .withIndex("by_user_id", (q) => q.eq("userId", args.user_id))
      .order("desc")
      .collect();
  },
});

export const generateThreadTitle = action({
  args: { text: v.string(), threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    try {
      const firstMessage = args.text;
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Generate a concise, descriptive title (max 50 characters) for a conversation based on the following first message. Focus on the main topic or intent. Don't add double quotes at the start and end of the title."
          },
          {
            role: "user",
            content: firstMessage
          }
        ],
        max_tokens: 20,
      });
      
      const content = response.choices[0]?.message?.content;
      const title = content ? content.trim().slice(0, 50) : "Untitled Conversation";
      
      console.log("Generated title for thread", args.threadId, ":", title);
      
      await ctx.runMutation(internal.threads.updateThreadTitle, {
        threadId: args.threadId,
        title: title
      });
      
      return title;
    } catch (error) {
      console.error("Error generating title for thread", args.threadId, ":", error);
      
      await ctx.runMutation(internal.threads.updateThreadTitle, {
        threadId: args.threadId,
        title: "Untitled Conversation"
      });
      
      return "Untitled Conversation";
    }
  },
});

export const updateThreadTitle = internalMutation({
  args: {
    threadId: v.id("threads"),
    title: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, { title: args.title });
    return args.title;
  },
});

export const renameThreadTitle = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.threadId, {
      title: args.title,
      updated_at: Date.now(),
    });
    return args.title;
  },
});

export const deleteThread = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.threadId);
    return null;
  },
});