import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/automation/claim-event",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    const secret = process.env.N8N_CALLBACK_SECRET;

    if (!secret) {
      return new Response("Server configuration error.", {
        status: 500,
      });
    }

    const authorization = request.headers.get("Authorization");

    if (authorization !== `Bearer ${secret}`) {
      return new Response("Unauthorized.", { status: 401 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON.", { status: 400 });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("eventId" in body) ||
      typeof body.eventId !== "string" ||
      body.eventId.length === 0
    ) {
      return new Response("Invalid payload.", { status: 400 });
    }

    try {
      const result = await ctx.runMutation(
        internal.automationMutations.claimAutomationEvent,
        { eventId: body.eventId },
      );

      return Response.json(result, { status: 200 });
    } catch {
      return new Response("Unable to claim automation event.", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/automation/notification-result",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    const secret = process.env.N8N_CALLBACK_SECRET;

    if (!secret) {
      return new Response("Server configuration error.", {
        status: 500,
      });
    }

    const authorization = request.headers.get("Authorization");

    if (authorization !== `Bearer ${secret}`) {
      return new Response("Unauthorized.", {
        status: 401,
      });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON.", {
        status: 400,
      });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("eventId" in body) ||
      !("status" in body)
    ) {
      return new Response("Invalid payload.", {
        status: 400,
      });
    }

    const payload = body as {
      eventId: string;
      status: string;
      errorMessage?: string;
    };

    if (
      typeof payload.eventId !== "string" ||
      payload.eventId.length === 0 ||
      (payload.status !== "succeeded" && payload.status !== "failed") ||
      (payload.errorMessage !== undefined &&
        typeof payload.errorMessage !== "string")
    ) {
      return new Response("Invalid payload fields.", { status: 400 });
    }

    try {
      const result = await ctx.runMutation(
        internal.automationMutations.recordNotificationResult,
        {
          eventId: payload.eventId,
          status: payload.status,
          ...(payload.errorMessage !== undefined && {
            errorMessage: payload.errorMessage,
          }),
        },
      );

      return Response.json(result, { status: 200 });
    } catch {
      return new Response("Unable to record notification result.", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/automation/overdue-reminders",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    const secret = process.env.N8N_WEBHOOK_SECRET;

    if (!secret || !/^[0-9a-f]{64}$/i.test(secret)) {
      return new Response("Server configuration error.", {
        status: 500,
      });
    }

    const timestampHeader = request.headers.get("X-LendLoop-Timestamp");

    const signatureHeader = request.headers.get("X-LendLoop-Signature");

    if (
      !timestampHeader ||
      !/^\d+$/.test(timestampHeader) ||
      !signatureHeader ||
      !/^[0-9a-f]{64}$/i.test(signatureHeader)
    ) {
      return new Response("Missing or invalid signature headers.", {
        status: 401,
      });
    }

    const timestamp = Number(timestampHeader);
    const now = Math.floor(Date.now() / 1000);

    if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > 300) {
      return new Response("Request timestamp expired.", {
        status: 401,
      });
    }

    const rawBody = await request.text();

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON.", { status: 400 });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("action" in body) ||
      body.action !== "generate"
    ) {
      return new Response("Invalid request payload.", {
        status: 400,
      });
    }

    try {
      const secretBytes = new Uint8Array(
        secret.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
      );

      const key = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );

      const signedContent = `${timestampHeader}.${rawBody}`;

      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(signedContent),
      );

      const expectedSignature = Array.from(new Uint8Array(signature))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      if (expectedSignature.toLowerCase() !== signatureHeader.toLowerCase()) {
        return new Response("Invalid signature.", {
          status: 401,
        });
      }

      const result = await ctx.runMutation(
        internal.automationMutations.generateOverdueReminderBatch,
        {},
      );

      return Response.json(result, { status: 200 });
    } catch {
      return new Response("Unable to generate overdue reminders.", {
        status: 500,
      });
    }
  }),
});

http.route({
  path: "/automation/overdue-reminder-result",
  method: "POST",

  handler: httpAction(async (ctx, request) => {
    const secret = process.env.N8N_CALLBACK_SECRET;

    if (!secret) {
      return new Response("Server configuration error.", {
        status: 500,
      });
    }

    const authorization = request.headers.get("Authorization");

    if (authorization !== `Bearer ${secret}`) {
      return new Response("Unauthorized.", { status: 401 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON.", { status: 400 });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("eventId" in body) ||
      !("status" in body)
    ) {
      return new Response("Invalid payload.", { status: 400 });
    }

    const payload = body as {
      eventId: string;
      status: string;
      errorMessage?: string;
    };

    if (
      typeof payload.eventId !== "string" ||
      payload.eventId.length === 0 ||
      (payload.status !== "succeeded" && payload.status !== "failed") ||
      (payload.errorMessage !== undefined &&
        typeof payload.errorMessage !== "string")
    ) {
      return new Response("Invalid payload fields.", { status: 400 });
    }

    try {
      const result = await ctx.runMutation(
        internal.automationMutations.recordOverdueReminderResult,
        {
          eventId: payload.eventId,
          status: payload.status,
          ...(payload.errorMessage !== undefined && {
            errorMessage: payload.errorMessage,
          }),
        },
      );

      return Response.json(result, { status: 200 });
    } catch {
      return new Response("Unable to record overdue reminder result.", {
        status: 400,
      });
    }
  }),
});

export default http;
