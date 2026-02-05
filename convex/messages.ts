import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { streamingComponent } from "./streaming";
import { api } from "./_generated/api";

export const listMessages = query({
  args: { thread_id: v.optional(v.id("threads")) },
  handler: async (ctx, args) => {
    const q = ctx.db.query("messages");
    if (args.thread_id) {
      return await q
        .withIndex("by_thread_id", (q) => q.eq("threadId", args.thread_id))
        .order("asc")
        .collect();
    }
    return await q.order("asc").collect();
  },
});

export const getMessage = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const patchAssistantText = mutation({
  args: {
    id: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { text: args.text });
    console.log("Patched assistant message with text:", args.text);
  },
});

export const sendMessage = mutation({
  args: {
    text: v.string(),
    thread_id: v.optional(v.id("threads")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let threadId = args.thread_id;

    if (!threadId) {
      threadId = await ctx.db.insert("threads", {
        userId: args.userId,
        title: "New Conversation",
        messages: [],
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      console.log("Created new threadId:", threadId);
    } else {
      await ctx.db.patch(threadId, { updated_at: Date.now() });
    }

    const userMessageId = await ctx.db.insert("messages", {
      threadId,
      role: "user",
      text: args.text,
    });

    const thread = await ctx.db.get(threadId);
    if (thread) {
      await ctx.db.patch(threadId, {
        messages: [...thread.messages, userMessageId],
      });
    }

    const responseStreamId = await streamingComponent.createStream(ctx);
    const assistantId = await ctx.db.insert("messages", {
      threadId,
      role: "assistant",
      text: "",
      responseStreamId,
    });

    const updatedThread = await ctx.db.get(threadId);
    if (updatedThread) {
      await ctx.db.patch(threadId, {
        messages: [...updatedThread.messages, assistantId],
      });
    }

    // Get the thread to check if it already has a meaningful title
    if (thread && (thread.title === "New Conversation" || !thread.title)) {
      // Set a temporary title immediately based on first message
      await ctx.db.patch(threadId, { title: `Chat about ${args.text.slice(0, 30)}...` });
      
      // Schedule title generation only for new conversations
      await ctx.scheduler.runAfter(0, api.threads.generateThreadTitle, { text: args.text, threadId: threadId });
    }

    return { assistantId, threadId };
  },
});