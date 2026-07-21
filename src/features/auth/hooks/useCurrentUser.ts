import { useQuery } from "@tanstack/react-query";

import { tokenService } from "@/services/token.service";

import { getCurrentUser } from "../api/auth.api";
import { authKeys } from "../api/auth.keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: tokenService.hasAccessToken(),
    retry: false,
    staleTime: 60_000,
  });
}