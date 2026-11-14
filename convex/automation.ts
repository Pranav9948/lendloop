"use node";

import { v } from "convex/values";
import { createHmac } from "node:crypto";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const generateHmacTestSignature = internalAction({
  args: {
    timestamp: v.number(),
    rawBody: v.string(),
  },

  handler: async (_ctx, args) => {
    const secret = process.env.N8N_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error("N8N_WEBHOOK_SECRET is not configured.");
    }

    if (!/^[0-9a-f]{64}$/i.test(secret)) {
      throw new Error(
        "N8N_WEBHOOK_SECRET must be a 64-character hexadecimal secret.",
      );
    }

    if (!Number.isSafeInteger(args.timestamp) || args.timestamp <= 0) {
      throw new Error("Invalid timestamp.");
    }

    const signature = createHmac("sha256", Buffer.from(secret, "hex"))
      .update(`${args.timestamp}.${args.rawBody}`, "utf8")
      .digest("hex");

    return {
      signature,
      timestamp: args.timestamp,
    };
  },
});

export const dispatchAutomationEvent = internalAction({
  args: {
    eventId: v.id("automationEvents"),
  },

  handler: async (ctx, args) => {
    const secret = process.env.N8N_WEBHOOK_SECRET;
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!secret || !/^[0-9a-f]{64}$/i.test(secret)) {
      throw new Error("Invalid N8N_WEBHOOK_SECRET configuration.");
    }

    if (!webhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is not configured.");
    }

    const parsedUrl = new URL(webhookUrl);

    if (parsedUrl.protocol !== "https:") {
      throw new Error("The n8n webhook must use HTTPS.");
    }

    const payload = await ctx.runQuery(
      internal.automationMutations.getAutomationEventPayload,
      { eventId: args.eventId },
    );

    const timestamp = Math.floor(Date.now() / 1000);
    const rawBody = JSON.stringify(payload);

    const signature = createHmac("sha256", Buffer.from(secret, "hex"))
      .update(`${timestamp}.${rawBody}`, "utf8")
      .digest("hex");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LendLoop-Timestamp": String(timestamp),
        "X-LendLoop-Signature": signature,
      },
      body: rawBody,
    });

    if (!response.ok) {
      const errorMessage = `n8n returned HTTP ${response.status}`;

      await ctx.runMutation(
        internal.automationMutations.recordNotificationResult,
        {
          eventId: args.eventId,
          status: "failed",
          errorMessage,
        },
      );

      throw new Error(errorMessage);
    }

    return {
      success: true,
      eventId: args.eventId,
      message: "Event delivered to n8n.",
    };
  },
});
