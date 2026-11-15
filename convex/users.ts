import { mutation, query } from "./_generated/server";

// Find the authenticated user's profile or create it.
export const getOrCreateCurrentUser = mutation({
  args: {},

  handler: async (ctx) => {
    // 1. Retrieve the verified Clerk identity.
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // 2. Find the matching Convex user profile.
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();

    // 3. If the profile exists, update available identity details.
    if (existingUser) {
      const updates: {
        name?: string;
        email?: string;
        searchText?: string;
        updatedAt?: number;
      } = {};

      if (identity.name !== undefined && identity.name !== existingUser.name) {
        updates.name = identity.name;
      }

      if (
        identity.email !== undefined &&
        identity.email !== existingUser.email
      ) {
        updates.email = identity.email;
      }

      const nextName = identity.name ?? existingUser.name ?? "";
      const nextEmail = identity.email ?? existingUser.email ?? "";

      updates.searchText = `${nextName} ${nextEmail}`.toLowerCase();

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = now;

        await ctx.db.patch(existingUser._id, updates);
      }

      return {
        userId: existingUser._id,
        role: existingUser.role,
        created: false,
      };
    }

    // 4. Create a new profile.
    // The role is always assigned by the backend.
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      role: "user",
      createdAt: now,
      updatedAt: now,
      searchText:
        `${identity.name ?? ""} ${identity.email ?? ""}`.toLowerCase(),

      ...(identity.name !== undefined ? { name: identity.name } : {}),

      ...(identity.email !== undefined ? { email: identity.email } : {}),
    });

    return {
      userId,
      role: "user" as const,
      created: true,
    };
  },
});

// Retrieve only the authenticated user's own profile.
export const getCurrentUserProfile = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  },
});
