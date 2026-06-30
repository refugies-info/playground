"use client";

import { useEffect, useState } from "react";
import type { CurrentUser } from "@/lib/auth";
import { getCurrentUserAction } from "@/services/current-user";

interface UseCurrentUserResult {
  user: CurrentUser | null;
  isLoading: boolean;
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCurrentUserAction()
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isLoading };
}
