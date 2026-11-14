import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";

export const getMyLoans = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const [borrowedLoans, lentLoans] = await Promise.all([
      ctx.db
        .query("loans")
        .withIndex("by_borrower", (q) => q.eq("borrowerId", user._id))
        .collect(),

      ctx.db
        .query("loans")
        .withIndex("by_lender", (q) => q.eq("lenderId", user._id))
        .collect(),
    ]);

    const loans = [
      ...borrowedLoans.map((loan) => ({
        ...loan,
        relationship: "borrowed" as const,
      })),
      ...lentLoans.map((loan) => ({
        ...loan,
        relationship: "lent" as const,
      })),
    ];

    const loansWithTools = await Promise.all(
      loans.map(async (loan) => {
        const tool = await ctx.db.get(loan.toolId);

        return {
          _id: loan._id,
          startDate: loan.startDate,
          dueDate: loan.dueDate,
          status: loan.status,
          returnedAt: loan.returnedAt,
          createdAt: loan.createdAt,
          relationship: loan.relationship,
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

    return loansWithTools.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const markLoanReturned = mutation({
  args: {
    loanId: v.id("loans"),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate the current user
    const user = await requireCurrentUser(ctx);

    // 2. Retrieve the loan
    const loan = await ctx.db.get(args.loanId);

    if (!loan) {
      throw new Error("Loan not found.");
    }

    // 3. Only the lender can confirm the return
    if (loan.lenderId !== user._id) {
      throw new Error(
        "Only the lender can confirm that the tool has been returned.",
      );
    }

    // 4. Prevent duplicate returns
    if (loan.status !== "active") {
      throw new Error("This loan has already been returned.");
    }

    // 5. Update loan status
    const now = Date.now();

    await ctx.db.patch(loan._id, {
      status: "returned",
      returnedAt: now,
      updatedAt: now,
    });

    return loan._id;
  },
});
