import { query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";

export const getOverview = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const [
      activeCommunityTools,
      myListings,
      myRequests,
      incomingRequests,
      borrowedLoans,
      lentLoans,
    ] = await Promise.all([
      ctx.db
        .query("tools")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect(),

      ctx.db
        .query("tools")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect(),

      ctx.db
        .query("borrowRequests")
        .withIndex("by_borrower", (q) => q.eq("borrowerId", user._id))
        .collect(),

      ctx.db
        .query("borrowRequests")
        .withIndex("by_lender", (q) => q.eq("lenderId", user._id))
        .collect(),

      ctx.db
        .query("loans")
        .withIndex("by_borrower", (q) => q.eq("borrowerId", user._id))
        .collect(),

      ctx.db
        .query("loans")
        .withIndex("by_lender", (q) => q.eq("lenderId", user._id))
        .collect(),
    ]);

    return {
      name: user.name ?? "there",
      role: user.role,
      stats: {
        activeCommunityTools: activeCommunityTools.length,
        myListings: myListings.length,
        myRequests: myRequests.length,
        incomingRequests: incomingRequests.length,
        myLoans: borrowedLoans.length + lentLoans.length,
      },
    };
  },
});
