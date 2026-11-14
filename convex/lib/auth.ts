import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthContext = QueryCtx | MutationCtx;

export async function getCurrentUser(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

// Requires an authenticated user with an existing profile.
export async function requireCurrentUser(ctx: AuthContext) {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("Unauthorized: User profile not found");
  }

  return user;
}

// Requires the current user to have the admin role.
export async function requireAdmin(ctx: AuthContext) {
  const user = await requireCurrentUser(ctx);

  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

// Requires the current user to own the specified tool.
export async function requireToolOwner(ctx: AuthContext, toolId: Id<"tools">) {
  const user = await requireCurrentUser(ctx);

  const tool = await ctx.db.get(toolId);

  if (!tool || tool.ownerId !== user._id) {
    throw new Error("Forbidden: Tool ownership required");
  }

  return { user, tool };
}

// Requires the current user to be involved in the borrow request.
export async function requireRequestParticipant(
  ctx: AuthContext,
  requestId: Id<"borrowRequests">,
) {
  const user = await requireCurrentUser(ctx);

  const request = await ctx.db.get(requestId);

  if (
    !request ||
    (request.borrowerId !== user._id && request.lenderId !== user._id)
  ) {
    throw new Error("Forbidden: Request access denied");
  }

  return { user, request };
}

export async function requireLoanParticipant(
  ctx: AuthContext,
  loanId: Id<"loans">,
) {
  const user = await requireCurrentUser(ctx);

  const loan = await ctx.db.get(loanId);

  if (!loan || (loan.borrowerId !== user._id && loan.lenderId !== user._id)) {
    throw new Error("Forbidden: Loan access denied");
  }

  return { user, loan };
}
