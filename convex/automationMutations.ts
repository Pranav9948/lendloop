import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const recordNotificationResult = internalMutation({
  args: {
    eventId: v.string(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const eventId = ctx.db.normalizeId("automationEvents", args.eventId);

    if (!eventId) {
      throw new Error("Invalid automation event ID.");
    }

    const event = await ctx.db.get(eventId);

    if (!event) {
      throw new Error("Automation event not found.");
    }

    const now = Date.now();

    // A successful result must never be downgraded.
    if (event.status === "succeeded") {
      return {
        success: true,
        duplicate: true,
      };
    }

    // Only allow notification events awaiting processing
    // or events that previously failed.
    if (
      event.status !== "pending" &&
      event.status !== "processing" &&
      event.status !== "failed"
    ) {
      throw new Error("Invalid automation event status.");
    }

    if (args.status === "failed" && !args.errorMessage?.trim()) {
      throw new Error("A failure reason is required.");
    }

    await ctx.db.patch(eventId, {
      status: args.status,
      attemptCount: event.attemptCount + 1,
      lastAttemptAt: now,
      completedAt: args.status === "succeeded" ? now : undefined,
      errorMessage:
        args.status === "failed" ? args.errorMessage!.slice(0, 500) : undefined,
      updatedAt: now,
    });

    return {
      success: true,
      duplicate: false,
    };
  },
});

export const getAutomationEventPayload = internalQuery({
  args: {
    eventId: v.id("automationEvents"),
  },

  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Automation event not found.");
    }

    if (!event.relatedRequestId) {
      throw new Error("Related borrowing request not found.");
    }

    if (
      event.eventType !== "request_created" &&
      event.eventType !== "request_approved" &&
      event.eventType !== "request_declined"
    ) {
      throw new Error("Unsupported notification event type.");
    }

    const [request, recipient] = await Promise.all([
      ctx.db.get(event.relatedRequestId),
      ctx.db.get(event.recipientId),
    ]);

    if (!request || !recipient) {
      throw new Error("Request or recipient not found.");
    }

    const tool = await ctx.db.get(request.toolId);

    if (!tool) {
      throw new Error("Tool not found.");
    }

    return {
      event: {
        eventId: event._id,
        eventType: event.eventType,

        recipient: {
          userId: recipient._id,
          name: recipient.name ?? "LendLoop member",
          email: recipient.email ?? "",
        },

        toolName: tool.name,

        request: {
          startDate: new Date(request.startDate).toISOString().slice(0, 10),

          endDate: new Date(request.endDate).toISOString().slice(0, 10),
        },
      },
    };
  },
});
