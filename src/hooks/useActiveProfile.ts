import { useCallback, useEffect, useState } from "react";
import type { Profile } from "../types";
import {
  clearActiveProfile,
  getActiveProfile,
  setActiveProfile
} from "../db/profileRepository";

export function useActiveProfile() {
  const [activeProfile, setActiveProfileState] = useState<Profile | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const refreshActiveProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      setActiveProfileState(await getActiveProfile());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chooseProfile = useCallback(
    async (profileId: string) => {
      setActiveProfile(profileId);
      await refreshActiveProfile();
    },
    [refreshActiveProfile]
  );

  const removeActiveProfile = useCallback(() => {
    clearActiveProfile();
    setActiveProfileState(undefined);
  }, []);

  useEffect(() => {
    void refreshActiveProfile();
  }, [refreshActiveProfile]);

  return {
    activeProfile,
    isLoading,
    chooseProfile,
    clearActiveProfile: removeActiveProfile,
    refreshActiveProfile
  };
}
