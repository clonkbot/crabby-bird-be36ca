import { query } from "./_generated/server";

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_score")
      .order("desc")
      .take(10);

    return scores;
  },
});

export const getRecentScores = query({
  args: {},
  handler: async (ctx) => {
    const scores = await ctx.db
      .query("scores")
      .order("desc")
      .take(20);

    return scores;
  },
});
