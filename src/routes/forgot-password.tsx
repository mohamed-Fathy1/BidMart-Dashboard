import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  useForgotPasswordMutation,
  useResendForgotPasswordOtpMutation,
  useResetPasswordMutation,
} from "@/features/auth/auth.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LangSwitcher } from "@/components/layout/lang-switcher";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

/* ------------------------------------------------------------------ */
/*  Step 1 — Email                                                     */
/* ------------------------------------------------------------------ */

const emailSchema = z.object({
  email: z.string().email(),
});
type EmailForm = z.infer<typeof emailSchema>;

/* ------------------------------------------------------------------ */
/*  Step 2 — OTP + new password                                        */
/* ------------------------------------------------------------------ */

const resetSchema = z
  .object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8).max(20),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type ResetForm = z.infer<typeof resetSchema>;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");

  const forgotMutation = useForgotPasswordMutation();
  const resendMutation = useResendForgotPasswordOtpMutation();
  const resetMutation = useResetPasswordMutation();

  /* --- step 1 form --- */
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  function onEmailSubmit(data: EmailForm) {
    forgotMutation.mutate(data, {
      onSuccess: () => {
        setEmail(data.email);
        setStep("reset");
      },
    });
  }

  /* --- step 2 form --- */
  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  function onResetSubmit(data: ResetForm) {
    resetMutation.mutate({ email, ...data });
  }

  function handleResend() {
    resendMutation.mutate({ email });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="absolute top-4 end-4">
        <LangSwitcher />
      </div>

      <Card className="w-full max-w-sm">
        {step === "email" ? (
          <>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("common:auth.forgot_password")}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t("common:auth.forgot_password_hint")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fp-email">{t("common:labels.email")}</Label>
                  <Input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending
                    ? t("common:states.loading")
                    : t("common:auth.send_code")}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    {t("common:auth.back_to_login")}
                  </Link>
                </p>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("common:auth.reset_password")}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t("common:auth.reset_password_hint", { email })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={resetForm.handleSubmit(onResetSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fp-otp">{t("common:auth.otp_code")}</Label>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendMutation.isPending}
                      className="text-xs text-primary hover:underline disabled:opacity-50"
                    >
                      {resendMutation.isPending
                        ? t("common:states.loading")
                        : t("common:auth.resend_code")}
                    </button>
                  </div>
                  <Input
                    id="fp-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="font-mono tracking-widest text-center"
                    {...resetForm.register("otp")}
                  />
                  {resetForm.formState.errors.otp && (
                    <p className="text-xs text-destructive">
                      {resetForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fp-new-pass">
                    {t("common:auth.new_password")}
                  </Label>
                  <Input
                    id="fp-new-pass"
                    type="password"
                    autoComplete="new-password"
                    {...resetForm.register("newPassword")}
                  />
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fp-confirm-pass">
                    {t("common:auth.confirm_password")}
                  </Label>
                  <Input
                    id="fp-confirm-pass"
                    type="password"
                    autoComplete="new-password"
                    {...resetForm.register("confirmPassword")}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending
                    ? t("common:states.loading")
                    : t("common:auth.reset_password_submit")}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-primary hover:underline"
                  >
                    {t("common:auth.back_to_email")}
                  </button>
                </p>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
