"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../convex/_generated/api";

export default function AuthTestPage() {
  const user = useQuery(api.authTest.getCurrentUser);

  const getOrCreateUser = useMutation(api.users.getOrCreateCurrentUser);

  const profile = useQuery(api.users.getCurrentUserProfile);

  const hasStarted = useRef(false);

  useEffect(() => {
    if (user === undefined || user === null) {
      return;
    }

    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    getOrCreateUser().catch((error) => {
      console.error("Profile synchronization failed:", error);
    });
  }, [user, getOrCreateUser]);

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Clerk + Convex Authentication Test</h1>

      <AuthLoading>Checking authentication...</AuthLoading>

      <Unauthenticated>
        <p>You are not authenticated.</p>
      </Unauthenticated>

      <Authenticated>
        <h2 className="font-semibold">Authenticated successfully!</h2>

        <section>
          <h3 className="font-semibold">Clerk Identity</h3>

          <pre className="bg-gray-100 text-black p-4 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </section>

        <section>
          <h3 className="font-semibold">Convex User Profile</h3>

          <pre className="bg-gray-100 text-black p-4 rounded">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </section>
      </Authenticated>
    </main>
  );
}
