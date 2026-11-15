import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";

async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User account not found.");
  }

  return user;
}
// Get the current user's notifications.
export const listMyNotifications = query({
  args: {},

  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

// Get unread notification count.
export const getUnreadNotificationCount = query({
  args: {},

  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .collect();

    return notifications.length;
  },
});

// Mark one notification as read.
export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const notification = await ctx.db.get(args.notificationId);

    if (!notification) {
      throw new Error("Notification not found.");
    }

    if (notification.userId !== user._id) {
      throw new Error("You cannot update another user's notification.");
    }

    if (!notification.isRead) {
      await ctx.db.patch(args.notificationId, {
        isRead: true,
      });
    }

    return { success: true };
  },
});

// Mark all of the current user's notifications as read.
export const markAllNotificationsAsRead = mutation({
  args: {},

  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", user._id).eq("isRead", false),
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }

    return {
      success: true,
      updatedCount: unreadNotifications.length,
    };
  },
});

// Internal-only creation function for trusted backend workflows.
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("request_created"),
      v.literal("request_approved"),
      v.literal("request_declined"),
      v.literal("overdue_reminder"),
    ),
    title: v.string(),
    message: v.string(),
    automationEventId: v.string(),
    relatedRequestId: v.optional(v.id("borrowRequests")),
    relatedLoanId: v.optional(v.id("loans")),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_automation_event", (q) =>
        q.eq("automationEventId", args.automationEventId),
      )
      .unique();

    if (existing) {
      return {
        success: true,
        duplicate: true,
        notificationId: existing._id,
      };
    }

    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });

    return {
      success: true,
      duplicate: false,
      notificationId,
    };
  },
});
