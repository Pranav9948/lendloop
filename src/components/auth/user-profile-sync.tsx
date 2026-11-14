"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../convex/_generated/api";

export function UserProfileSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  const profile = useQuery(api.users.getCurrentUserProfile);

  const getOrCreateUser = useMutation(api.users.getOrCreateCurrentUser);

  const attemptedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    // Wait until the profile query finishes.
    if (profile === undefined) {
      return;
    }

    // An existing profile does not need synchronization.
    if (profile !== null) {
      return;
    }

    // Avoid repeated calls for the same user.
    if (attemptedUserId.current === userId) {
      return;
    }

    attemptedUserId.current = userId;

    getOrCreateUser().catch((error) => {
      attemptedUserId.current = null;

      console.error("User profile synchronization failed:", error);
    });
  }, [isLoaded, isSignedIn, userId, profile, getOrCreateUser]);

  return null;
}
