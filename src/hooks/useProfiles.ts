import { useCallback, useEffect, useState } from "react";
import type { Profile } from "../types";
import { createProfile, getProfiles } from "../db/profileRepository";

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const refreshProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setProfiles(await getProfiles());
    } catch {
      setError("No pudimos cargar los perfiles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProfile = useCallback(
    async (name: string) => {
      const profile = await createProfile({ name });
      await refreshProfiles();
      return profile;
    },
    [refreshProfiles]
  );

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles]);

  return {
    profiles,
    isLoading,
    error,
    addProfile,
    refreshProfiles
  };
}
