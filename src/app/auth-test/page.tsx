"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AuthTestPage() {
  const user = useQuery(api.authTest.getCurrentUser);

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Clerk + Convex Authentication Test</h1>

      <AuthLoading>Checking authentication...</AuthLoading>

      <Unauthenticated>
        <p>You are not authenticated.</p>
      </Unauthenticated>

      <Authenticated>
        <h2 className="font-semibold">Authenticated successfully!</h2>

        <pre className="bg-gray-100 text-black p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </Authenticated>
    </main>
  );
}
