import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

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

export default http;
