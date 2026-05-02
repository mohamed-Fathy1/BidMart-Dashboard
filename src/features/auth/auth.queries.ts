import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  loginRequest,
  getMeRequest,
  logoutRequest,
  forgotPasswordRequest,
  resendForgotPasswordOtp,
  resetPasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from "@/features/auth/auth.api";

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession(data);
      navigate({ to: "/overview" });
    },
  });
}

export function useMeQuery() {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const data = await getMeRequest();
      setSession({
        user: data.user,
        token: token!,
        permissions: data.permissions,
      });
      return data;
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      clearSession();
    }
  }, [query.isError, clearSession]);

  return query;
}

export function useLogoutMutation() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession();
      navigate({ to: "/login" });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Forgot / Reset password                                            */
/* ------------------------------------------------------------------ */

export function useForgotPasswordMutation() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPasswordRequest(data),
    onSuccess: () => {
      toast.success(t("common:auth.otp_sent"));
    },
  });
}

export function useResendForgotPasswordOtpMutation() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => resendForgotPasswordOtp(data),
    onSuccess: () => {
      toast.success(t("common:auth.otp_resent"));
    },
  });
}

export function useResetPasswordMutation() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPasswordRequest(data),
    onSuccess: () => {
      toast.success(t("common:auth.password_reset_success"));
      navigate({ to: "/login" });
    },
  });
}
