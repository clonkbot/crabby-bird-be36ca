import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrCreate = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { username: args.username });
      return existing._id;
    }

    return await ctx.db.insert("players", {
      userId,
      username: args.username,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: Date.now(),
    });
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updateStats = mutation({
  args: { score: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    const newHighScore = Math.max(player.highScore, args.score);
    await ctx.db.patch(player._id, {
      highScore: newHighScore,
      gamesPlayed: player.gamesPlayed + 1,
    });

    // Record this score
    await ctx.db.insert("scores", {
      userId,
      username: player.username,
      score: args.score,
      createdAt: Date.now(),
    });

    return newHighScore;
  },
});
