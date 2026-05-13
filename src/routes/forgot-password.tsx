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
import { AuthShell } from "@/components/layout/auth-shell";
import { PasswordInput } from "@/components/shared/password-input";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

const emailSchema = z.object({
  email: z.string().email({ message: "common:auth.invalid_email" }),
});
type EmailForm = z.infer<typeof emailSchema>;

const RESET_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const resetSchema = z
  .object({
    otp: z
      .string()
      .length(6, { message: "common:auth.otp_length" })
      .regex(/^\d{6}$/, { message: "common:auth.otp_digits" }),
    newPassword: z
      .string()
      .min(8, { message: "common:auth.password_length" })
      .max(20, { message: "common:auth.password_length" })
      .regex(RESET_PASSWORD_REGEX, {
        message: "common:auth.password_strength",
      }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "common:auth.passwords_mismatch",
    path: ["confirmPassword"],
  });
type ResetForm = z.infer<typeof resetSchema>;

function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");

  const forgotMutation = useForgotPasswordMutation();
  const resendMutation = useResendForgotPasswordOtpMutation();
  const resetMutation = useResetPasswordMutation();

  return (
    <AuthShell>
      {step === "email" ? (
        <EmailStep
          isPending={forgotMutation.isPending}
          onSubmit={(data) =>
            forgotMutation.mutate(data, {
              onSuccess: () => {
                setEmail(data.email);
                setStep("reset");
              },
            })
          }
        />
      ) : (
        <ResetStep
          email={email}
          isPending={resetMutation.isPending}
          isResending={resendMutation.isPending}
          onSubmit={(data) => resetMutation.mutate({ email, ...data })}
          onResend={() => resendMutation.mutate({ email })}
          onBack={() => setStep("email")}
        />
      )}
    </AuthShell>
  );
}

interface EmailStepProps {
  isPending: boolean;
  onSubmit: (data: EmailForm) => void;
}

function EmailStep({ isPending, onSubmit }: EmailStepProps) {
  const { t } = useTranslation();
  const form = useForm<EmailForm>({ resolver: zodResolver(emailSchema), mode: "onBlur" });

  return (
    <>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("common:auth.forgot_password")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("common:auth.forgot_password_hint")}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="fp-email">{t("common:labels.email")}</Label>
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            placeholder="you@bidmart.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          {form.formState.errors.email?.message && (
            <p className="text-xs text-destructive">
              {t(form.formState.errors.email.message)}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending
            ? t("common:states.loading")
            : t("common:auth.send_code")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            {t("common:auth.back_to_login")}
          </Link>
        </p>
      </form>
    </>
  );
}

interface ResetStepProps {
  email: string;
  isPending: boolean;
  isResending: boolean;
  onSubmit: (data: ResetForm) => void;
  onResend: () => void;
  onBack: () => void;
}

function ResetStep({
  email,
  isPending,
  isResending,
  onSubmit,
  onResend,
  onBack,
}: ResetStepProps) {
  const { t } = useTranslation();
  const form = useForm<ResetForm>({ resolver: zodResolver(resetSchema), mode: "onBlur" });

  return (
    <>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("common:auth.reset_password")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("common:auth.reset_password_hint", { email })}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="fp-otp">{t("common:auth.otp_code")}</Label>
            <button
              type="button"
              onClick={onResend}
              disabled={isResending}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              {isResending
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
            className="text-center font-mono text-lg tracking-[0.5em]"
            aria-invalid={!!form.formState.errors.otp}
            {...form.register("otp")}
          />
          {form.formState.errors.otp?.message && (
            <p className="text-xs text-destructive">
              {t(form.formState.errors.otp.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fp-new-pass">
            {t("common:auth.new_password")}
          </Label>
          <PasswordInput
            id="fp-new-pass"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.newPassword}
            {...form.register("newPassword")}
          />
          {form.formState.errors.newPassword?.message && (
            <p className="text-xs text-destructive">
              {t(form.formState.errors.newPassword.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fp-confirm-pass">
            {t("common:auth.confirm_password")}
          </Label>
          <PasswordInput
            id="fp-confirm-pass"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.confirmPassword}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword?.message && (
            <p className="text-xs text-destructive">
              {t(form.formState.errors.confirmPassword.message)}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending
            ? t("common:states.loading")
            : t("common:auth.reset_password_submit")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-primary hover:underline"
          >
            {t("common:auth.back_to_email")}
          </button>
        </p>
      </form>
    </>
  );
}
