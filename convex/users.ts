import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
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