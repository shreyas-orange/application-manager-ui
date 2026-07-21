import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { queryClient } from "@/app/query-client";
import { tokenService } from "@/services/token.service";

import { logoutUser } from "../api/auth.api";

export function useLogout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,

    onSettled: async () => {
      tokenService.clearTokens();

      await queryClient.cancelQueries();
      queryClient.clear();

      navigate("/login", {
        replace: true,
      });
    },
  });
}