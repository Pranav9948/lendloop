import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { createAutomationEvent } from "./lib/automation";

export const getMyRequests = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const requests = await ctx.db
      .query("borrowRequests")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", user._id))
      .collect();

    const requestsWithTools = await Promise.all(
      requests.map(async (request) => {
        const tool = await ctx.db.get(request.toolId);

        return {
          _id: request._id,
          startDate: request.startDate,
          endDate: request.endDate,
          status: request.status,
          createdAt: request.createdAt,
          tool: tool
            ? {
                name: tool.name,
                category: tool.category,
                imageUrl: tool.imageId
                  ? await ctx.storage.getUrl(tool.imageId)
                  : null,
              }
            : null,
        };
      }),
    );

    return requestsWithTools;
  },
});

export const getIncomingRequests = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const requests = await ctx.db
      .query("borrowRequests")
      .withIndex("by_lender", (q) => q.eq("lenderId", user._id))
      .collect();

    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const [tool, borrower] = await Promise.all([
          ctx.db.get(request.toolId),
          ctx.db.get(request.borrowerId),
        ]);

        return {
          _id: request._id,
          startDate: request.startDate,
          endDate: request.endDate,
          status: request.status,
          createdAt: request.createdAt,

          tool: tool
            ? {
                name: tool.name,
                category: tool.category,
                imageUrl: tool.imageId
                  ? await ctx.storage.getUrl(tool.imageId)
                  : null,
              }
            : null,

          borrower: borrower
            ? {
                name: borrower.name ?? "LendLoop member",
              }
            : null,
        };
      }),
    );

    return requestsWithDetails;
  },
});

export const createBorrowRequest = mutation({
  args: {
    toolId: v.id("tools"),
    startDate: v.number(),
    endDate: v.number(),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate the borrower
    const user = await requireCurrentUser(ctx);

    // 2. Validate dates
    const now = Date.now();

    if (!Number.isFinite(args.startDate) || !Number.isFinite(args.endDate)) {
      throw new Error("Invalid borrowing dates.");
    }

    if (args.startDate < now) {
      throw new Error("Start date cannot be in the past.");
    }

    if (args.endDate <= args.startDate) {
      throw new Error("End date must be after the start date.");
    }

    // 3. Retrieve the requested tool
    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found.");
    }

    if (tool.status !== "active") {
      throw new Error("This tool is no longer available.");
    }

    // 4. Prevent users from requesting their own tools

    if (tool.ownerId === user._id) {
      throw new Error("You cannot borrow your own tool.");
    }

    // 5. Check existing requests for this tool
    const existingRequests = await ctx.db
      .query("borrowRequests")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const hasConflictingRequest = existingRequests.some(
      (request) =>
        request.status === "pending" &&
        args.startDate < request.endDate &&
        args.endDate > request.startDate,
    );

    if (hasConflictingRequest) {
      throw new Error(
        "This tool already has a pending request for the selected dates.",
      );
    }

    // 6. Check existing active loans
    const existingLoans = await ctx.db
      .query("loans")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const hasConflictingLoan = existingLoans.some(
      (loan) =>
        loan.status === "active" &&
        args.startDate < loan.dueDate &&
        args.endDate > loan.startDate,
    );

    if (hasConflictingLoan) {
      throw new Error(
        "This tool is already borrowed during the selected dates.",
      );
    }

    // 7. Create the borrow request
    const nowTimestamp = Date.now();

    const requestId = await ctx.db.insert("borrowRequests", {
      toolId: args.toolId,
      borrowerId: user._id,
      lenderId: tool.ownerId,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "pending",
      createdAt: nowTimestamp,
      updatedAt: nowTimestamp,
    });

    await createAutomationEvent(ctx, {
      eventType: "request_created",
      relatedRequestId: requestId,
      recipientId: tool.ownerId,
    });

    return requestId;
  },
});

export const approveBorrowRequest = mutation({
  args: {
    requestId: v.id("borrowRequests"),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate the lender
    const user = await requireCurrentUser(ctx);

    // 2. Find the request
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Borrow request not found.");
    }

    // 3. Verify lender ownership
    if (request.lenderId !== user._id) {
      throw new Error("You are not authorized to approve this request.");
    }

    // 4. Only pending requests can be approved
    if (request.status !== "pending") {
      throw new Error("This request has already been processed.");
    }

    // 5. Verify that the tool is still active
    const tool = await ctx.db.get(request.toolId);

    if (!tool || tool.status !== "active") {
      throw new Error("This tool is no longer available.");
    }

    // 6. Prevent duplicate loan creation
    const existingLoan = await ctx.db
      .query("loans")
      .withIndex("by_request", (q) => q.eq("requestId", request._id))
      .unique();

    if (existingLoan) {
      throw new Error("A loan already exists for this request.");
    }

    // 7. Check for conflicting active loans
    const existingLoans = await ctx.db
      .query("loans")
      .withIndex("by_tool", (q) => q.eq("toolId", request.toolId))
      .collect();

    const hasConflict = existingLoans.some(
      (loan) =>
        loan.status === "active" &&
        request.startDate < loan.dueDate &&
        request.endDate > loan.startDate,
    );

    if (hasConflict) {
      throw new Error(
        "This tool has already been booked for overlapping dates.",
      );
    }

    // 8. Create the loan
    const now = Date.now();

    const loanId = await ctx.db.insert("loans", {
      requestId: request._id,
      toolId: request.toolId,
      lenderId: request.lenderId,
      borrowerId: request.borrowerId,
      startDate: request.startDate,
      dueDate: request.endDate,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // 9. Update request status
    await ctx.db.patch(request._id, {
      status: "approved",
      updatedAt: now,
    });

    await createAutomationEvent(ctx, {
      eventType: "request_approved",
      relatedRequestId: request._id,
      relatedLoanId: loanId,
      recipientId: request.borrowerId,
    });

    return loanId;
  },
});

export const declineBorrowRequest = mutation({
  args: {
    requestId: v.id("borrowRequests"),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate
    const user = await requireCurrentUser(ctx);

    // 2. Find request
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Borrow request not found.");
    }

    // 3. Verify lender ownership
    if (request.lenderId !== user._id) {
      throw new Error("You are not authorized to decline this request.");
    }

    // 4. Only pending requests can be declined
    if (request.status !== "pending") {
      throw new Error("This request has already been processed.");
    }

    // 5. Update request status
    await ctx.db.patch(request._id, {
      status: "declined",
      updatedAt: Date.now(),
    });

    await createAutomationEvent(ctx, {
      eventType: "request_declined",
      relatedRequestId: request._id,
      recipientId: request.borrowerId,
    });

    return request._id;
  },
});

export const cancelBorrowRequest = mutation({
  args: {
    requestId: v.id("borrowRequests"),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate the borrower
    const user = await requireCurrentUser(ctx);

    // 2. Retrieve the request
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Borrow request not found.");
    }

    // 3. Only the borrower can cancel their request
    if (request.borrowerId !== user._id) {
      throw new Error("You are not authorized to cancel this request.");
    }

    // 4. Only pending requests can be cancelled
    if (request.status !== "pending") {
      throw new Error("Only pending requests can be cancelled.");
    }

    // 5. Update request status
    await ctx.db.patch(request._id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return request._id;
  },
});

export const getUnavailableDates = query({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    await requireCurrentUser(ctx);

    const tool = await ctx.db.get(args.toolId);

    if (!tool || tool.status !== "active") {
      throw new Error("This tool is no longer available.");
    }

    const [requests, loans] = await Promise.all([
      ctx.db
        .query("borrowRequests")
        .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
        .collect(),

      ctx.db
        .query("loans")
        .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
        .collect(),
    ]);

    const pendingRanges = requests
      .filter((request) => request.status === "pending")
      .map((request) => ({
        startDate: request.startDate,
        endDate: request.endDate,
      }));

    const activeLoanRanges = loans
      .filter((loan) => loan.status === "active")
      .map((loan) => ({
        startDate: loan.startDate,
        endDate: loan.dueDate,
      }));

    return {
      unavailableRanges: [...pendingRanges, ...activeLoanRanges],
    };
  },
});
