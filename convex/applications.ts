import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const saveApplication = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    address: v.string(),
    preferredDate: v.optional(v.string()),
    memo: v.optional(v.string()),
    quoteType: v.string(),
    quoteSummary: v.string(),
    quoteTotal: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("applications", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    })
  },
})

export const listApplications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_createdAt")
      .order("desc")
      .collect()
  },
})

export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status })
  },
})

export const getApplicationStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("applications").collect()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTs = today.getTime()

    const todayCount = all.filter(a => a.createdAt >= todayTs).length
    const byStatus = all.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total: all.length, todayCount, byStatus }
  },
})
