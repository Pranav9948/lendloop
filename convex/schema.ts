import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),

    name: v.optional(v.string()),

    email: v.optional(v.string()),
    isTrusted: v.optional(v.boolean()),
    role: v.union(v.literal("user"), v.literal("admin")),
    searchText: v.optional(v.string()),

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_created_at", ["createdAt"])
    .searchIndex("search_users", {
      searchField: "searchText",
      filterFields: ["role", "isTrusted"],
    }),

  notifications: defineTable({
    userId: v.id("users"),

    type: v.union(
      v.literal("request_created"),
      v.literal("request_approved"),
      v.literal("request_declined"),
      v.literal("overdue_reminder"),
    ),

    title: v.string(),

    message: v.string(),

    relatedRequestId: v.optional(v.id("borrowRequests")),

    relatedLoanId: v.optional(v.id("loans")),

    automationEventId: v.string(),

    isRead: v.boolean(),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"])
    .index("by_automation_event", ["automationEventId"]),

  tools: defineTable({
    name: v.string(),

    category: v.union(
      v.literal("power_tools"),
      v.literal("garden"),
      v.literal("kitchen"),
      v.literal("camping"),
      v.literal("other"),
    ),

    searchText: v.optional(v.string()),
    condition: v.union(
      v.literal("new"),
      v.literal("good"),
      v.literal("fair"),
      v.literal("needs_repair"),
    ),

    description: v.string(),

    imageId: v.optional(v.id("_storage")),

    ownerId: v.id("users"),

    status: v.union(v.literal("active"), v.literal("archived")),

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_category_and_status", ["category", "status"])
    .index("by_created_at", ["createdAt"])
    .searchIndex("search_tools", {
      searchField: "searchText",
      filterFields: ["category", "condition", "status"],
    }),

  borrowRequests: defineTable({
    toolId: v.id("tools"),

    borrowerId: v.id("users"),

    lenderId: v.id("users"),

    startDate: v.number(),

    endDate: v.number(),

    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("cancelled"),
    ),

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_borrower", ["borrowerId"])
    .index("by_lender", ["lenderId"])
    .index("by_tool", ["toolId"])
    .index("by_lender_and_status", ["lenderId", "status"]),

  loans: defineTable({
    requestId: v.id("borrowRequests"),

    toolId: v.id("tools"),

    lenderId: v.id("users"),

    borrowerId: v.id("users"),
    searchText: v.optional(v.string()),
    startDate: v.number(),

    dueDate: v.number(),

    status: v.union(v.literal("active"), v.literal("returned")),

    returnedAt: v.optional(v.number()),

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_request", ["requestId"])
    .index("by_borrower", ["borrowerId"])
    .index("by_lender", ["lenderId"])
    .index("by_tool", ["toolId"])
    .index("by_status_and_due_date", ["status", "dueDate"])
    .index("by_created_at", ["createdAt"])
    .searchIndex("search_loans", {
      searchField: "searchText",
      filterFields: ["status"],
    }),

  trustedLenders: defineTable({
    userId: v.id("users"),

    grantedBy: v.id("users"),

    status: v.union(v.literal("active"), v.literal("revoked")),

    reason: v.optional(v.string()),

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  automationEvents: defineTable({
    eventType: v.union(
      v.literal("request_created"),
      v.literal("request_approved"),
      v.literal("request_declined"),
      v.literal("overdue_reminder"),
    ),

    reminderStage: v.optional(
      v.union(v.literal("day_1"), v.literal("day_3"), v.literal("day_7")),
    ),

    relatedRequestId: v.optional(v.id("borrowRequests")),

    relatedLoanId: v.optional(v.id("loans")),

    recipientId: v.id("users"),

    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),

    attemptCount: v.number(),

    lastAttemptAt: v.optional(v.number()),

    completedAt: v.optional(v.number()),

    errorMessage: v.optional(v.string()),

    createdAt: v.number(),

    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_request", ["relatedRequestId"])
    .index("by_loan", ["relatedLoanId"])
    .index("by_recipient", ["recipientId"])
    .index("by_loan_and_status", ["relatedLoanId", "status"]),

  processedEvents: defineTable({
    eventId: v.string(),

    eventType: v.string(),

    processedAt: v.number(),

    status: v.union(
      v.literal("processing"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),
  })
    .index("by_event_id", ["eventId"])
    .index("by_processed_at", ["processedAt"]),
});
