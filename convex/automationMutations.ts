import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery } from "./_generated/server";
import { createAutomationEvent } from "./lib/automation";

export const claimAutomationEvent = internalMutation({
  args: {
    eventId: v.string(),
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

    if (
      event.eventType !== "request_created" &&
      event.eventType !== "request_approved" &&
      event.eventType !== "request_declined" &&
      event.eventType !== "overdue_reminder"
    ) {
      throw new Error("Unsupported automation event type.");
    }

    if (event.status === "succeeded") {
      return { accepted: false, duplicate: true };
    }

    // Stop events that have exhausted all three attempts.
    if (event.attemptCount >= 3) {
      return { accepted: false, duplicate: true };
    }

    const existing = await ctx.db
      .query("processedEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (existing) {
      if (existing.status === "processing" || existing.status === "succeeded") {
        return { accepted: false, duplicate: true };
      }

      // A previously failed event can be retried.
      await ctx.db.patch(existing._id, {
        status: "processing",
        processedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("processedEvents", {
        eventId: args.eventId,
        eventType: event.eventType,
        processedAt: Date.now(),
        status: "processing",
      });
    }

    const now = Date.now();

    await ctx.db.patch(eventId, {
      status: "processing",
      attemptCount: event.attemptCount + 1,
      lastAttemptAt: now,
      completedAt: undefined,
      errorMessage: undefined,
      updatedAt: now,
    });

    return { accepted: true, duplicate: false };
  },
});

export const recordDispatchFailure = internalMutation({
  args: {
    eventId: v.string(),
    errorMessage: v.string(),
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

    const existing = await ctx.db
      .query("processedEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .unique();

    // Never overwrite a successful or already-recorded failure.
    if (
      event.status === "succeeded" ||
      existing?.status === "succeeded" ||
      event.status === "failed"
    ) {
      return { success: true, duplicate: true };
    }

    const now = Date.now();
    const nextAttemptCount = event.attemptCount + 1;

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "failed",
        processedAt: now,
      });
    } else {
      await ctx.db.insert("processedEvents", {
        eventId: args.eventId,
        eventType: event.eventType,
        processedAt: now,
        status: "failed",
      });
    }

    await ctx.db.patch(eventId, {
      status: "failed",
      attemptCount: nextAttemptCount,
      errorMessage: args.errorMessage.slice(0, 500),
      completedAt: undefined,
      updatedAt: now,
    });

    // Retry at most three times in total.
    if (nextAttemptCount < 3) {
      const delay = nextAttemptCount === 1 ? 60_000 : 300_000;

      await ctx.scheduler.runAfter(
        delay,
        internal.automation.dispatchAutomationEvent,
        { eventId },
      );
    }

    return {
      success: true,
      duplicate: false,
      attemptCount: nextAttemptCount,
      retryScheduled: nextAttemptCount < 3,
    };
  },
});

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

    const processedEvent = await ctx.db
      .query("processedEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (!processedEvent) {
      throw new Error("Event has not been claimed for processing.");
    }

    // Never downgrade a successful event.
    if (event.status === "succeeded" || processedEvent.status === "succeeded") {
      return { success: true, duplicate: true };
    }

    // Only a currently claimed event may report a result.
    if (
      event.status !== "processing" ||
      processedEvent.status !== "processing"
    ) {
      if (event.status === "failed" && processedEvent.status === "failed") {
        return { success: true, duplicate: true };
      }

      throw new Error("Event is not currently being processed.");
    }

    if (args.status === "failed" && !args.errorMessage?.trim()) {
      throw new Error("A failure reason is required.");
    }

    const now = Date.now();

    await ctx.db.patch(eventId, {
      status: args.status,
      completedAt: args.status === "succeeded" ? now : undefined,
      errorMessage:
        args.status === "failed" ? args.errorMessage!.slice(0, 500) : undefined,
      updatedAt: now,
    });

    await ctx.db.patch(processedEvent._id, {
      status: args.status,
      processedAt: now,
    });

    // Create an in-app notification only after successful processing.
    if (args.status === "succeeded") {
      const existingNotification = await ctx.db
        .query("notifications")
        .withIndex("by_automation_event", (q) =>
          q.eq("automationEventId", args.eventId),
        )
        .unique();

      if (!existingNotification) {
        const notificationContent = {
          request_created: {
            title: "New borrow request",
            message: "Someone has requested to borrow your listed item.",
          },
          request_approved: {
            title: "Borrow request approved",
            message: "Your borrowing request has been approved.",
          },
          request_declined: {
            title: "Borrow request declined",
            message: "Your borrowing request has been declined.",
          },
          overdue_reminder: {
            title: "Overdue loan reminder",
            message:
              "You have a loan that is overdue. Please arrange its return.",
          },
        }[event.eventType];

        if (!notificationContent) {
          throw new Error("Unsupported notification event type.");
        }

        await ctx.db.insert("notifications", {
          userId: event.recipientId,
          type: event.eventType,
          title: notificationContent.title,
          message: notificationContent.message,
          automationEventId: args.eventId,
          ...(event.relatedRequestId && {
            relatedRequestId: event.relatedRequestId,
          }),
          ...(event.relatedLoanId && {
            relatedLoanId: event.relatedLoanId,
          }),
          isRead: false,
          createdAt: now,
        });
      }
    }

    let retryScheduled = false;

    if (args.status === "failed" && event.attemptCount < 3) {
      const delay = event.attemptCount === 1 ? 60_000 : 300_000;

      await ctx.scheduler.runAfter(
        delay,
        internal.automation.dispatchAutomationEvent,
        { eventId },
      );

      retryScheduled = true;
    }

    return {
      success: true,
      duplicate: false,
      attemptCount: event.attemptCount,
      retryScheduled,
    };
  },
});

export const recordOverdueReminderResult = internalMutation({
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

    if (!event || event.eventType !== "overdue_reminder") {
      throw new Error("Overdue reminder event not found.");
    }

    const processedEvent = await ctx.db
      .query("processedEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (!processedEvent) {
      throw new Error("Event has not been claimed.");
    }

    // Never downgrade a successful event.
    if (event.status === "succeeded" || processedEvent.status === "succeeded") {
      return { success: true, duplicate: true };
    }

    // Only a currently claimed event may report a result.
    if (
      event.status !== "processing" ||
      processedEvent.status !== "processing"
    ) {
      if (event.status === "failed" && processedEvent.status === "failed") {
        return { success: true, duplicate: true };
      }

      throw new Error("Event is not currently being processed.");
    }

    if (args.status === "failed" && !args.errorMessage?.trim()) {
      throw new Error("A failure reason is required.");
    }

    const now = Date.now();

    await ctx.db.patch(eventId, {
      status: args.status,
      completedAt: args.status === "succeeded" ? now : undefined,
      errorMessage:
        args.status === "failed" ? args.errorMessage!.slice(0, 500) : undefined,
      updatedAt: now,
    });

    await ctx.db.patch(processedEvent._id, {
      status: args.status,
      processedAt: now,
    });

    // Create the in-app notification only after successful processing.
    if (args.status === "succeeded") {
      const existingNotification = await ctx.db
        .query("notifications")
        .withIndex("by_automation_event", (q) =>
          q.eq("automationEventId", args.eventId),
        )
        .unique();

      if (!existingNotification) {
        await ctx.db.insert("notifications", {
          userId: event.recipientId,
          type: "overdue_reminder",
          title: "Overdue loan reminder",
          message:
            event.reminderStage === "day_1"
              ? "Your loan is one day overdue. Please arrange its return."
              : event.reminderStage === "day_3"
                ? "Your loan is three days overdue. Please arrange its return."
                : "Your loan is seven days overdue. Please arrange its return.",
          automationEventId: args.eventId,
          ...(event.relatedLoanId && {
            relatedLoanId: event.relatedLoanId,
          }),
          isRead: false,
          createdAt: now,
        });
      }
    }

    // Do not dispatch Workflow 1 here.
    // Failed events can be retried by the next daily Workflow 2 execution.
    return {
      success: true,
      duplicate: false,
      status: args.status,
      attemptCount: event.attemptCount,
      retryOnNextDailyRun: args.status === "failed" && event.attemptCount < 3,
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

    const recipient = await ctx.db.get(event.recipientId);

    if (!recipient) {
      throw new Error("Notification recipient not found.");
    }

    // Common event information.
    const recipientDetails = {
      userId: recipient._id,
      name: recipient.name ?? "LendLoop member",
      email: recipient.email ?? "",
    };

    // Handle overdue loan reminders.
    if (event.eventType === "overdue_reminder") {
      if (!event.relatedLoanId) {
        throw new Error("Related loan not found.");
      }

      const loan = await ctx.db.get(event.relatedLoanId);

      if (!loan) {
        throw new Error("Loan not found.");
      }

      if (loan.status !== "active") {
        throw new Error("Loan is no longer active.");
      }

      const tool = await ctx.db.get(loan.toolId);

      if (!tool) {
        throw new Error("Tool not found.");
      }

      return {
        event: {
          eventId: event._id,
          eventType: event.eventType,
          reminderStage: event.reminderStage,
          recipient: recipientDetails,
          toolName: tool.name,
          loan: {
            startDate: new Date(loan.startDate).toISOString().slice(0, 10),
            dueDate: new Date(loan.dueDate).toISOString().slice(0, 10),
          },
        },
      };
    }

    // Handle existing borrowing request notifications.
    if (
      event.eventType !== "request_created" &&
      event.eventType !== "request_approved" &&
      event.eventType !== "request_declined"
    ) {
      throw new Error("Unsupported notification event type.");
    }

    if (!event.relatedRequestId) {
      throw new Error("Related borrowing request not found.");
    }

    const request = await ctx.db.get(event.relatedRequestId);

    if (!request) {
      throw new Error("Borrowing request not found.");
    }

    const tool = await ctx.db.get(request.toolId);

    if (!tool) {
      throw new Error("Tool not found.");
    }

    return {
      event: {
        eventId: event._id,
        eventType: event.eventType,
        reminderStage: event.reminderStage,
        recipient: recipientDetails,
        toolName: tool.name,
        request: {
          startDate: new Date(request.startDate).toISOString().slice(0, 10),
          endDate: new Date(request.endDate).toISOString().slice(0, 10),
        },
      },
    };
  },
});

export const generateOverdueReminders = internalMutation({
  args: {},

  handler: async (ctx) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const overdueLoans = await ctx.db
      .query("loans")
      .withIndex("by_status_and_due_date", (q) =>
        q.eq("status", "active").lte("dueDate", now),
      )
      .collect();

    let created = 0;
    let skipped = 0;

    for (const loan of overdueLoans) {
      // Calculate complete days overdue.
      const overdueDays = Math.floor((now - loan.dueDate) / DAY);

      // Select the highest reminder stage currently due.
      let reminderStage: "day_1" | "day_3" | "day_7" | null = null;

      if (overdueDays >= 7) {
        reminderStage = "day_7";
      } else if (overdueDays >= 3) {
        reminderStage = "day_3";
      } else if (overdueDays >= 1) {
        reminderStage = "day_1";
      }

      if (!reminderStage) {
        skipped++;
        continue;
      }

      // Find existing overdue reminder events for this loan.
      const existingEvents = await ctx.db
        .query("automationEvents")
        .withIndex("by_loan", (q) => q.eq("relatedLoanId", loan._id))
        .collect();

      const alreadySent = existingEvents.some(
        (event) =>
          event.eventType === "overdue_reminder" &&
          event.reminderStage === reminderStage,
      );

      if (alreadySent) {
        skipped++;
        continue;
      }

      // Create the reminder exclusively for this overdue stage.
      await createAutomationEvent(ctx, {
        eventType: "overdue_reminder",
        relatedLoanId: loan._id,
        recipientId: loan.borrowerId,
        reminderStage,
      });

      created++;
    }

    return {
      success: true,
      overdueLoansFound: overdueLoans.length,
      remindersCreated: created,
      remindersSkipped: skipped,
    };
  },
});

export const prepareAutomationDispatch = internalMutation({
  args: {
    eventId: v.id("automationEvents"),
  },

  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Automation event not found.");
    }

    if (event.status === "succeeded") {
      return { ready: false, duplicate: true };
    }

    if (event.status === "processing") {
      return { ready: false, duplicate: true };
    }

    if (event.attemptCount >= 3) {
      return { ready: false, duplicate: true };
    }

    await ctx.db.patch(args.eventId, {
      status: "processing",
      updatedAt: Date.now(),
    });

    return { ready: true, duplicate: false };
  },
});

export const generateOverdueReminderBatch = internalMutation({
  args: {},

  handler: async (ctx) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const overdueLoans = await ctx.db
      .query("loans")
      .withIndex("by_status_and_due_date", (q) =>
        q.eq("status", "active").lte("dueDate", now),
      )
      .collect();

    const reminders = [];

    for (const loan of overdueLoans) {
      const overdueDays = Math.floor((now - loan.dueDate) / DAY);

      let reminderStage: "day_1" | "day_3" | "day_7" | null = null;

      if (overdueDays >= 7) {
        reminderStage = "day_7";
      } else if (overdueDays >= 3) {
        reminderStage = "day_3";
      } else if (overdueDays >= 1) {
        reminderStage = "day_1";
      }

      if (!reminderStage) continue;

      const existingEvents = await ctx.db
        .query("automationEvents")
        .withIndex("by_loan", (q) => q.eq("relatedLoanId", loan._id))
        .collect();

      const existingEvent = existingEvents.find(
        (event) =>
          event.eventType === "overdue_reminder" &&
          event.reminderStage === reminderStage,
      );

      // Already successfully processed or currently processing.

      if (
        existingEvent?.status === "succeeded" ||
        existingEvent?.status === "processing" ||
        (existingEvent && existingEvent.attemptCount >= 3)
      ) {
        continue;
      }

      let eventId = existingEvent?._id;

      // Create an event directly. Do not call createAutomationEvent(),
      // because that function automatically dispatches to Workflow 1.
      if (!eventId) {
        eventId = await ctx.db.insert("automationEvents", {
          eventType: "overdue_reminder",
          relatedLoanId: loan._id,
          recipientId: loan.borrowerId,
          reminderStage,
          status: "pending",
          attemptCount: 0,
          createdAt: now,
          updatedAt: now,
        });
      }

      const borrower = await ctx.db.get(loan.borrowerId);
      const tool = await ctx.db.get(loan.toolId);

      if (!borrower || !tool) continue;

      reminders.push({
        eventId,
        eventType: "overdue_reminder" as const,
        reminderStage,
        overdueDays,
        recipient: {
          userId: borrower._id,
          name: borrower.name ?? "Borrower",
        },
        toolName: tool.name,
        loan: {
          loanId: loan._id,
          startDate: loan.startDate,
          dueDate: loan.dueDate,
        },
      });
    }

    return {
      success: true,
      checkedLoans: overdueLoans.length,
      remindersCount: reminders.length,
      reminders,
    };
  },
});
