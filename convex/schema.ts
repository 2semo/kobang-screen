import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,

  // 견적 조회 기록 (결과 페이지 도달 시)
  quotes: defineTable({
    quoteType: v.string(),        // safetyScreen | blackScreenMesh | mixed
    brand: v.optional(v.string()),
    meshType: v.optional(v.string()),
    installType: v.optional(v.string()),
    total: v.number(),
    quoteSummary: v.string(),
    createdAt: v.number(),        // Date.now()
  }).index("by_createdAt", ["createdAt"]),

  // 시공 신청 기록
  applications: defineTable({
    name: v.string(),
    phone: v.string(),
    address: v.string(),
    preferredDate: v.optional(v.string()),
    memo: v.optional(v.string()),
    quoteType: v.string(),
    quoteSummary: v.string(),
    quoteTotal: v.number(),
    status: v.string(),           // new | consulting | confirmed | completed | cancelled
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"])
    .index("by_status", ["status"]),
})
