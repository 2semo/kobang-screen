import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const saveQuote = mutation({
  args: {
    quoteType: v.string(),
    brand: v.optional(v.string()),
    meshType: v.optional(v.string()),
    installType: v.optional(v.string()),
    total: v.number(),
    quoteSummary: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quotes", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const listQuotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_createdAt")
      .order("desc")
      .take(100)
  },
})

export const getQuoteStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("quotes").collect()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTs = today.getTime()

    const todayCount = all.filter(q => q.createdAt >= todayTs).length
    const byType = all.reduce((acc, q) => {
      acc[q.quoteType] = (acc[q.quoteType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total: all.length, todayCount, byType }
  },
})
