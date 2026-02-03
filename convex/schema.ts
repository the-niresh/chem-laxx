import { defineSchema, defineTable } from "convex/server";
import { StreamIdValidator } from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";

const schema = defineSchema({
  // User table...
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    avatar_url: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // tables for audit templates:
  rawMaterialChemicals: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  soldChemicalCombinations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    pricePerKg: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  threads: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    messages: v.array(v.id("messages")),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_user_id", ["userId"]),

  messages: defineTable({
    threadId: v.optional(v.id("threads")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    text: v.string(),
    responseStreamId: v.optional(StreamIdValidator), // Only for streaming assistants
  }).index("by_thread_id", ["threadId"]),

  //   ...authTables:
  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    secret: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("userIdAndProvider", ["userId", "provider"])
    .index("providerAndAccountId", ["provider", "providerAccountId"]),

  authRefreshTokens: defineTable({
    sessionId: v.id("authSessions"),
    expirationTime: v.number(),
    firstUsedTime: v.optional(v.number()),
    // This is the ID of the refresh token that was exchanged to create this one.
    parentRefreshTokenId: v.optional(v.id("authRefreshTokens")),
  })
    // Sort by creationTime
    .index("sessionId", ["sessionId"])
    .index("sessionIdAndParentRefreshTokenId", [
      "sessionId",
      "parentRefreshTokenId",
    ]),

  authVerificationCodes: defineTable({
    accountId: v.id("authAccounts"),
    provider: v.string(),
    code: v.string(),
    expirationTime: v.number(),
    verifier: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("accountId", ["accountId"])
    .index("code", ["code"]),

  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.optional(v.string()),
  }).index("signature", ["signature"]),

  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("userId", ["userId"]),

  authRateLimits: defineTable({
    identifier: v.string(),
    lastAttemptTime: v.number(),
    attemptsLeft: v.number(),
  }).index("identifier", ["identifier"]),
});

export default schema;
