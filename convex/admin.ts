import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

// Admin: archive any tool listing.
export const removeAnyTool = mutation({
  args: {
    toolId: v.id("tools"),
  },

  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const tool = await ctx.db.get(args.toolId);

    if (!tool) {
      throw new Error("Tool not found");
    }

    if (tool.status === "archived") {
      return {
        success: true,
        message: "Tool is already archived",
      };
    }

    await ctx.db.patch(tool._id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      removedBy: admin._id,
    };
  },
});

// Admin: view all loans.
export const getAllLoans = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("loans").collect();
  },
});

// Admin: grant trusted-lender status.
export const grantTrustedLender = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const targetUser = await ctx.db.get(args.userId);

    if (!targetUser) {
      throw new Error("User not found");
    }

    const existingActiveRecord = await ctx.db
      .query("trustedLenders")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active"),
      )
      .unique();

    if (existingActiveRecord) {
      return {
        success: true,
        alreadyTrusted: true,
      };
    }

    const now = Date.now();

    const trustedLenderId = await ctx.db.insert("trustedLenders", {
      userId: args.userId,
      grantedBy: admin._id,
      status: "active",
      reason: args.reason,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      trustedLenderId,
    };
  },
});

// Admin: revoke trusted-lender status.
export const revokeTrustedLender = mutation({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const activeRecord = await ctx.db
      .query("trustedLenders")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", args.userId).eq("status", "active"),
      )
      .unique();

    if (!activeRecord) {
      return {
        success: true,
        alreadyRevoked: true,
      };
    }

    await ctx.db.patch(activeRecord._id, {
      status: "revoked",
      updatedAt: Date.now(),
    });

    return {
      success: true,
    };
  },
});

// Admin: retrieve dashboard summary statistics.
export const getAdminOverview = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [users, activeTools, loans, trustedLenders] = await Promise.all([
      ctx.db.query("users").collect(),

      ctx.db
        .query("tools")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect(),

      ctx.db.query("loans").collect(),

      ctx.db
        .query("trustedLenders")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect(),
    ]);

    const overdueLoans = loans.filter(
      (loan) => loan.status === "active" && loan.dueDate < Date.now(),
    ).length;

    return {
      totalUsers: users.length,
      activeTools: activeTools.length,
      totalLoans: loans.length,
      activeLoans: loans.filter((loan) => loan.status === "active").length,
      returnedLoans: loans.filter((loan) => loan.status === "returned").length,
      trustedLenders: trustedLenders.length,
      overdueLoans,
    };
  },
});

// Admin: view all loans with related tool and participant details.

export const getAllLoansWithDetails = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    const loans = await ctx.db.query("loans").collect();

    const loansWithDetails = await Promise.all(
      loans.map(async (loan) => {
        const [tool, borrower, lender] = await Promise.all([
          ctx.db.get(loan.toolId),
          ctx.db.get(loan.borrowerId),
          ctx.db.get(loan.lenderId),
        ]);

        return {
          _id: loan._id,
          startDate: loan.startDate,
          dueDate: loan.dueDate,
          returnedAt: loan.returnedAt,
          status: loan.status,
          createdAt: loan.createdAt,
          isOverdue: loan.status === "active" && loan.dueDate < Date.now(),

          tool: tool ? { name: tool.name, category: tool.category } : null,

          borrower: borrower
            ? { name: borrower.name ?? "LendLoop member" }
            : null,

          lender: lender
            ? {
                name: lender.name ?? "Unknown lender",
                email: lender.email,
              }
            : null,
        };
      }),
    );

    return loansWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Admin: retrieve users and their trusted-lender status.
export const getTrustedLenderManagementData = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [users, activeTrustedLenders] = await Promise.all([
      ctx.db.query("users").collect(),

      ctx.db
        .query("trustedLenders")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect(),
    ]);

    const trustedUserIds = new Set(
      activeTrustedLenders.map((record) => record.userId),
    );

    return users.map((user) => ({
      _id: user._id,
      name: user.name ?? "LendLoop member",
      email: user.email,
      isTrusted: trustedUserIds.has(user._id),
    }));
  },
});

export const getAllToolsWithDetails = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Retrieve every listing, including archived tools
    const tools = await ctx.db.query("tools").collect();

    const toolsWithDetails = await Promise.all(
      tools.map(async (tool) => {
        const owner = await ctx.db.get(tool.ownerId);
        const imageUrl = tool.imageId
          ? await ctx.storage.getUrl(tool.imageId)
          : null;

        return {
          _id: tool._id,
          name: tool.name,
          category: tool.category,
          condition: tool.condition,
          description: tool.description,
          status: tool.status,
          createdAt: tool.createdAt,
          updatedAt: tool.updatedAt,
          imageUrl,

          owner: owner
            ? {
                name: owner.name ?? "LendLoop member",
                email: owner.email,
              }
            : null,
        };
      }),
    );

    return toolsWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});
