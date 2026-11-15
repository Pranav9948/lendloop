/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as authTest from "../authTest.js";
import type * as automation from "../automation.js";
import type * as automationMutations from "../automationMutations.js";
import type * as borrowRequests from "../borrowRequests.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_automation from "../lib/automation.js";
import type * as loans from "../loans.js";
import type * as notifications from "../notifications.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  authTest: typeof authTest;
  automation: typeof automation;
  automationMutations: typeof automationMutations;
  borrowRequests: typeof borrowRequests;
  crons: typeof crons;
  dashboard: typeof dashboard;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/automation": typeof lib_automation;
  loans: typeof loans;
  notifications: typeof notifications;
  tools: typeof tools;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
