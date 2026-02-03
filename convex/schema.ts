import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  scores: defineTable({
    userId: v.id("users"),
    username: v.string(),
    score: v.number(),
    createdAt: v.number(),
  })
    .index("by_score", ["score"])
    .index("by_user", ["userId"]),
  players: defineTable({
    userId: v.id("users"),
    username: v.string(),
    highScore: v.number(),
    gamesPlayed: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
