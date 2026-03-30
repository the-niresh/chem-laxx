import {
  action,
  mutation,
  query,
  internalMutation,
  httpAction,
} from "./_generated/server";
import { v } from "convex/values";
import { OpenAI } from "openai";
import { internal } from "./_generated/api";
import {
  PersistentTextStreaming,
  StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming,
);

export const getOpenAIResponse = action({
  args: { text: v.string(), threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    try {
      const firstMessage = args.text;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [
          {
            role: "system",
            content: `You are a senior chemical engineering decision-support expert working inside a chemical manufacturing and solutions company.

Your role is to assist employees in selecting the most appropriate chemical solution based on:
- Client requirements and use case
- Environmental and safety constraints
- Operational conditions
- Budget and pricing limits
- Performance expectations
- Historical usage and outcomes within the organization

You must analyze all provided inputs holistically and recommend the optimal chemical solution or combination. Ensure all answers are professional, deeply technical but clear, and immediately actionable for sales teams and engineering staff. If a query falls outside chemical manufacturing and solutions, politely decline and steer the conversation back to your expertise.`
          },
          {
            role: "user",
            content: firstMessage
          }
        ]
      });

      return await streamingComponent.streamText(ctx, response);
    } catch (error) {
      console.error("Error in getOpenAIResponse:", error);
      throw error;
    }
  },
});

export const getChatBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId,
    );
  },
});

export const getStreamBody = query({
  args: { streamId: StreamIdValidator },
  handler: async (ctx, args) => {
    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId,
    );
  },
});