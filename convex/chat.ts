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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set as a Convex secret
});

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming,
);

export const getOpenAIResponse = action({
  args: { text: v.string(), threadId: v.id("threads") },
  handler: async (ctx, args) => {
    try {
      // Get the first message to use as context for title generation
      const firstMessage = args.text;

      // Generate a title using OpenAI
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

You must analyze all provided inputs holistically and recommend the optimal chemical solution or combination.

Your recommendations must be:
- Practical and industry-realistic
- Cost-aware and performance-driven
- Aligned with environmental and safety considerations
- Consistent with past organizational learnings where applicable

Always take historical context into account so the employee understands:
- What was tried before
- What worked or failed
- Why the current recommendation is better

### Output Format (STRICT):
Respond in a clear, structured format using the following sections:

1. **Recommended Solution / Chemical Type**
   - Chemical name or category (avoid supplier-specific branding unless explicitly requested)

2. **Proposed Composition (Simple Terms)**
   - High-level explanation of the formulation or combination, written for non-experts

3. **Why This Fits the Requirements**
   - Bullet-point reasoning mapped directly to the user’s constraints

4. **Environmental & Safety Assessment**
   - Compliance, toxicity, VOC considerations, and wastewater handling

5. **Operational Performance Expectations**
   - Expected cleaning time, temperature compatibility, consistency, and reliability

6. **Estimated Cost Range**
   - Approximate price per unit (based on provided budget constraints)

7. **Historical Similarities (Internal Reference)**
   - Comparable past cases within the organization (if available or inferred)
   - Outcomes and lessons learned

8. **Expected Performance Improvement**
   - Efficiency gains, reduced wastage, error reduction, or time savings (estimated)

9. **Business Impact / Profitability**
   - How this recommendation improves cost efficiency, reduces risk, or increases client satisfaction

### Rules:
- Do not hallucinate specific supplier names or proprietary formulations unless explicitly provided.
- If information is missing, make reasonable industry assumptions and clearly state them.
- Prioritize consistency, accuracy, and decision confidence over excessive detail.
- The goal is to reduce trial-and-error and reliance on individual employee judgment.

You are not a general chatbot. You are a professional internal decision system.
`,
          },
          {
            role: "user",
            content: firstMessage,
          },
        ],
      });

      // Extract the title from the response
      let content = "";
      for await (const part of response) {
        const delta = part.choices?.[0]?.delta?.content;
        if (!delta) continue;
        content += delta;
      }

      console.log("OpenAI response for thread", args.threadId, ":", content);

      return content;
    } catch (error) {
      console.error(
        "Error generating title for thread",
        args.threadId,
        ":",
        error,
      );

      return "Untitled Conversation";
    }
  },
});

// export const chatStreamChat = httpAction(async (ctx, request) => {
//   const args = { text: v.string(), threadId: v.id("threads") };
//   const firstMessage = args.text;
//   const body = (await request.json()) as { streamId: string };
//   const response = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         stream: true,
//         messages: [
//           {
//             role: "system",
//             content: "You are a helpful assistant."
//           },
//           {
//             role: "user",
//             content: firstMessage
//           }
//         ],
//       });
//       await chunkAppender("Hi there!");
//       // Extract the title from the response
//       let content = "";
//       for await (const part of response) {
//         const delta = part.choices?.[0]?.delta?.content;
//         if (!delta) continue;
//         content += delta;
//       }
// })

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

// Create an HTTP action that generates chunks of the chat body
// and uses the component to stream them to the client and save them to the database.
export const streamChatChat = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const messageId = url.searchParams.get("message_id") || "";
  const threadIdFromQuery = url.searchParams.get("thread_id") || "";

  const body = (await request.json()) as {
    streamId: string;
    text?: string | null;
  };

  let firstMessage = body.text ?? "";
  if (!firstMessage) {
    let resolvedThreadId: Id<"threads"> | null = null;

    if (threadIdFromQuery) {
      resolvedThreadId = threadIdFromQuery as Id<"threads">;
    } else if (messageId) {
      const assistantMessage = await ctx.runQuery(api.messages.getMessage, {
        id: messageId as Id<"messages">,
      });
      resolvedThreadId = assistantMessage?.threadId ?? null;
    }

    if (resolvedThreadId) {
      const threadMessages = await ctx.runQuery(api.messages.listMessages, {
        thread_id: resolvedThreadId,
      });

      const lastUserMessage = [...threadMessages]
        .reverse()
        .find((m) => m.role === "user" && m.text !== "");
      firstMessage = lastUserMessage?.text ?? "";
    }
  }

  if (!firstMessage) {
    return new Response("Missing user message text", { status: 400 });
  }
  console.log("***,firstMessage", firstMessage);
  console.log("::::::::::::::::::");
  const response = await streamingComponent.stream(
    ctx,
    request,
    body.streamId as StreamId,
    async (_ctx, _request, _streamId, chunkAppender) => {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [
          {
            role: "system",
            content:
              `You are a senior chemical engineering decision-support expert working inside a chemical manufacturing and solutions company.

Your role is to assist employees in selecting the most appropriate chemical solution based on:
- Client requirements and use case
- Environmental and safety constraints
- Operational conditions
- Budget and pricing limits
- Performance expectations
- Historical usage and outcomes within the organization

You must analyze all provided inputs holistically and recommend the optimal chemical solution or combination.

Your recommendations must be:
- Practical and industry-realistic
- Cost-aware and performance-driven
- Aligned with environmental and safety considerations
- Consistent with past organizational learnings where applicable

Always take historical context into account so the employee understands:
- What was tried before
- What worked or failed
- Why the current recommendation is better

### Output Format (STRICT):
Respond in a clear, structured format using the following sections:

1. **Recommended Solution / Chemical Type**
   - Chemical name or category (avoid supplier-specific branding unless explicitly requested)

2. **Proposed Composition (Simple Terms)**
   - High-level explanation of the formulation or combination, written for non-experts

3. **Why This Fits the Requirements**
   - Bullet-point reasoning mapped directly to the user’s constraints

4. **Environmental & Safety Assessment**
   - Compliance, toxicity, VOC considerations, and wastewater handling

5. **Operational Performance Expectations**
   - Expected cleaning time, temperature compatibility, consistency, and reliability

6. **Estimated Cost Range**
   - Approximate price per unit (based on provided budget constraints)

7. **Historical Similarities (Internal Reference)**
   - Comparable past cases within the organization (if available or inferred)
   - Outcomes and lessons learned

8. **Expected Performance Improvement**
   - Efficiency gains, reduced wastage, error reduction, or time savings (estimated)

9. **Business Impact / Profitability**
   - How this recommendation improves cost efficiency, reduces risk, or increases client satisfaction

### Rules:
- Do not hallucinate specific supplier names or proprietary formulations unless explicitly provided.
- If information is missing, make reasonable industry assumptions and clearly state them.
- Prioritize consistency, accuracy, and decision confidence over excessive detail.
- The goal is to reduce trial-and-error and reliance on individual employee judgment.

You are not a general chatbot. You are a professional internal decision system.
`,
          },
          {
            role: "user",
            content: firstMessage,
          },
        ],
      });

      for await (const part of completion) {
        const delta = part.choices?.[0]?.delta?.content;
        console.log("delta", delta);
        if (!delta) continue;
        await chunkAppender(delta);
      }
    },
  );

  // Set CORS headers appropriately.
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");
  console.log("***,response", response);
  return response;
});
