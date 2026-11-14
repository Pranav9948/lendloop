import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type AutomationEventType =
  | "request_created"
  | "request_approved"
  | "request_declined"
  | "overdue_reminder";

type CreateAutomationEventArgs = {
  eventType: AutomationEventType;
  recipientId: Id<"users">;
  relatedRequestId?: Id<"borrowRequests">;
  relatedLoanId?: Id<"loans">;
};

export async function createAutomationEvent(
  ctx: MutationCtx,
  args: CreateAutomationEventArgs,
) {
  const now = Date.now();

  const eventId = await ctx.db.insert("automationEvents", {
    eventType: args.eventType,
    recipientId: args.recipientId,
    ...(args.relatedRequestId && {
      relatedRequestId: args.relatedRequestId,
    }),
    ...(args.relatedLoanId && {
      relatedLoanId: args.relatedLoanId,
    }),
    status: "pending",
    attemptCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.scheduler.runAfter(0, internal.automation.dispatchAutomationEvent, {
    eventId,
  });

  return eventId;
}
