import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { extractApiErrorMessage } from "@/lib/axios";
import { useAuthStore } from "@/features/auth/auth.store";
import {
  loginRequest,
  getMeRequest,
  logoutRequest,
  forgotPasswordRequest,
  resendForgotPasswordOtp,
  resetPasswordRequest,
  updateAdminProfileRequest,
  userFromAdminProfile,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type UpdateAdminProfileInput,
} from "@/features/auth/auth.api";

export function rejectionMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const fromBody = extractApiErrorMessage(error);
    if (fromBody?.trim()) return fromBody;
    if (
      typeof error.response?.statusText === 'string'
      && error.response.statusText.trim()
    ) {
      return error.response.statusText;
    }
  }
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    (error as { message: string }).message.trim()
  ) {
    return (error as { message: string }).message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

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

export function useUpdateAdminProfileMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (body: UpdateAdminProfileInput) => updateAdminProfileRequest(body),
    onSuccess: (data) => {
      const { token, permissions, user: currentUser } = useAuthStore.getState();
      if (!token) return;
      toast.success(t("profile:messages.saved"));
      const user = userFromAdminProfile(data.admin, currentUser?.role ?? "");
      setSession({ user, token, permissions });
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (err) => {
      toast.error(rejectionMessage(err, t("common:states.error")));
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
    onError: (err) => {
      toast.error(rejectionMessage(err, t("common:states.error")));
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
    onError: (err) => {
      toast.error(rejectionMessage(err, t("common:states.error")));
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
    onError: (err) => {
      toast.error(rejectionMessage(err, t("common:states.error")));
    },
  });
}
