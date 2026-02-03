import {
  PersistentTextStreaming,
  StreamId,
  StreamIdValidator,
} from "@convex-dev/persistent-text-streaming";
import { components } from "./_generated/api";
import { httpAction, query } from "./_generated/server";
import { OpenAI } from "openai";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const streamingComponent = new PersistentTextStreaming(
  components.persistentTextStreaming
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId
    );
  },
});

export const chatStream = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const messageId = url.searchParams.get("message_id") || "";
  if (!messageId) {
    return new Response("Missing message_id", { status: 400 });
  }

  const body = (await request.json()) as { streamId?: string };
  const streamId = body.streamId || "";
  if (!streamId) {
    return new Response("Missing streamId", { status: 400 });
  }

  const assistantMessage = await ctx.runQuery(api.messages.getMessage, {
    id: messageId as Id<"messages">,
  });
  if (!assistantMessage) {
    return new Response("Message not found", { status: 404 });
  }

  const threadId = assistantMessage.threadId;
  if (!threadId) {
    return new Response("Message missing threadId", { status: 400 });
  }

  const threadMessages = await ctx.runQuery(api.messages.listMessages, {
    thread_id: threadId,
  });

  const openAiMessages = threadMessages
    .filter((m) => m.text !== "")
    .map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.text,
    }));

  const response = await streamingComponent.stream(
    ctx,
    request,
    streamId as StreamId,
    async (_ctx, _request, _streamId, chunkAppender) => {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [
          { role: "system", content: `You are a senior chemical engineering decision-support expert working inside a chemical manufacturing and solutions company.

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
` },
          ...openAiMessages,
        ],
      });

      for await (const part of completion) {
        const delta = part.choices?.[0]?.delta?.content;
        if (!delta) continue;
        await chunkAppender(delta);
      }
    }
  );

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");
  return response;
});
