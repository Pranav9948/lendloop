import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser, requireToolOwner } from "./lib/auth";

const categoryValidator = v.union(
  v.literal("power_tools"),
  v.literal("garden"),
  v.literal("kitchen"),
  v.literal("camping"),
  v.literal("other"),
);

const conditionValidator = v.union(
  v.literal("new"),
  v.literal("good"),
  v.literal("fair"),
  v.literal("needs_repair"),
);

async function validateToolImage(ctx: MutationCtx, imageId: Id<"_storage">) {
  const image = await ctx.db.system.get("_storage", imageId);

  if (!image) {
    throw new Error("Uploaded image was not found.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!image.contentType || !allowedTypes.includes(image.contentType)) {
    throw new Error("Only JPEG, PNG and WebP images are allowed.");
  }

  if (image.size <= 0 || image.size > 5 * 1024 * 1024) {
    throw new Error("Image must be between 1 byte and 5 MB.");
  }
}

// Public query: exposes only basic tool information.

export const createTool = mutation({
  args: {
    name: v.string(),
    category: categoryValidator,
    condition: conditionValidator,
    description: v.string(),
    imageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    // 1. Authenticate the user.
    const user = await requireCurrentUser(ctx);

    // 2. Validate and normalize text fields.
    const name = args.name.trim();
    const description = args.description.trim();

    if (name.length < 2 || name.length > 80) {
      throw new Error("Tool name must be between 2 and 80 characters.");
    }

    if (description.length < 10 || description.length > 500) {
      throw new Error("Description must be between 10 and 500 characters.");
    }

    // 3. Verify that the uploaded image exists.
    const image = await ctx.db.system.get("_storage", args.imageId);

    if (!image) {
      throw new Error("Uploaded image was not found.");
    }

    // 4. Validate image type and size on the backend.
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!image.contentType || !allowedTypes.includes(image.contentType)) {
      throw new Error("Only JPEG, PNG and WebP images are allowed.");
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (image.size > maxFileSize || image.size <= 0) {
      throw new Error("Image must be between 1 byte and 5 MB.");
    }

    // 5. Create the listing.
    const now = Date.now();

    const toolId = await ctx.db.insert("tools", {
      name,
      category: args.category,
      condition: args.condition,
      description,
      imageId: args.imageId,
      ownerId: user._id,
      status: "active",
      searchText: `${name} ${args.category} ${args.condition}`.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    });

    return toolId;
  },
});

export const updateTool = mutation({
  args: {
    toolId: v.id("tools"),
    name: v.string(),
    category: categoryValidator,
    condition: conditionValidator,
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
  },

  handler: async (ctx, args) => {
    const { tool } = await requireToolOwner(ctx, args.toolId);

    const name = args.name.trim();
    const description = args.description.trim();

    if (name.length < 2 || name.length > 80) {
      throw new Error("Tool name must be between 2 and 80 characters.");
    }

    if (description.length < 10 || description.length > 500) {
      throw new Error("Description must be between 10 and 500 characters.");
    }

    if (tool.status !== "active") {
      throw new Error("Archived listings cannot be edited.");
    }

    if (args.imageId) {
      await validateToolImage(ctx, args.imageId);
    }

    const now = Date.now();

    await ctx.db.patch(args.toolId, {
      name,
      category: args.category,
      condition: args.condition,
      searchText: `${name} ${args.category} ${args.condition}`.toLowerCase(),
      description,
      ...(args.imageId ? { imageId: args.imageId } : {}),
      updatedAt: now,
    });

    // Delete the previous image only after successfully replacing it.
    if (args.imageId && tool.imageId && args.imageId !== tool.imageId) {
      await ctx.storage.delete(tool.imageId);
    }

    return args.toolId;
  },
});

export const deleteTool = mutation({
  args: {
    toolId: v.id("tools"),
  },

  handler: async (ctx, args) => {
    const { tool } = await requireToolOwner(ctx, args.toolId);

    if (tool.status === "archived") {
      throw new Error("This listing is already archived.");
    }

    await ctx.db.patch(args.toolId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return args.toolId;
  },
});

export const getPublicTools = query({
  args: {},

  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return tools.map((tool) => ({
      name: tool.name,
      category: tool.category,
    }));
  },
});

// Generate a temporary upload URL for an authenticated user.

export const generateToolImageUploadUrl = mutation({
  args: {},

  handler: async (ctx) => {
    await requireCurrentUser(ctx);

    const uploadUrl = await ctx.storage.generateUploadUrl();

    return uploadUrl;
  },
});

// Authenticated query: fetch all active community tools.
export const getAllActiveTools = query({
  args: {
    category: v.optional(categoryValidator),
  },

  handler: async (ctx, args) => {
    await requireCurrentUser(ctx);

    const tools = args.category
      ? await ctx.db
          .query("tools")
          .withIndex("by_category_and_status", (q) =>
            q.eq("category", args.category!).eq("status", "active"),
          )
          .collect()
      : await ctx.db
          .query("tools")
          .withIndex("by_status", (q) => q.eq("status", "active"))
          .collect();

    return await Promise.all(
      tools.map(async (tool) => ({
        _id: tool._id,
        name: tool.name,
        category: tool.category,
        condition: tool.condition,
        description: tool.description,
        status: tool.status,
        createdAt: tool.createdAt,
        imageUrl: tool.imageId ? await ctx.storage.getUrl(tool.imageId) : null,
        ownerId: tool.ownerId,
      })),
    );
  },
});

// Authenticated query: fetch only the current user's listings.
export const getMyListings = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const tools = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return await Promise.all(
      tools.map(async (tool) => ({
        _id: tool._id,
        name: tool.name,
        category: tool.category,
        condition: tool.condition,
        description: tool.description,
        status: tool.status,
        createdAt: tool.createdAt,
        updatedAt: tool.updatedAt,
        imageUrl: tool.imageId ? await ctx.storage.getUrl(tool.imageId) : null,
      })),
    );
  },
});
