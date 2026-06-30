"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/profile-name";
import { getProfilesByRoles } from "@/services/profiles";

interface UseProfilesResult {
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;
}

export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getProfilesByRoles()
      .then((data) => {
        if (!cancelled) setProfiles(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les profils");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { profiles, isLoading, error };
}
