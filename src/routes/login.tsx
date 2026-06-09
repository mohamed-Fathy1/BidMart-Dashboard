import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLoginMutation, rejectionMessage } from "@/features/auth/auth.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/shared/password-input";
import { AuthShell } from "@/components/layout/auth-shell";
import { onFormEnterKeyDown } from "@/lib/form-enter-submit";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email({ message: "common:auth.invalid_email" }),
  password: z
    .string()
    .min(8, { message: "common:auth.password_length" })
    .max(20, { message: "common:auth.password_length" }),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const { t } = useTranslation();
  const login = useLoginMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  function onSubmit(data: LoginForm) {
    login.mutate(data);
  }

  return (
    <AuthShell>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("common:auth.sign_in")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("common:auth.sign_in_subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={onFormEnterKeyDown}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t("common:labels.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@bidmart.com"
            aria-invalid={!!errors.email}
            className="bg-card"
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-xs text-destructive">
              {t(errors.email.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">
              {t("common:labels.password")}
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("common:auth.forgot_password")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={t("common:auth.password_placeholder")}
            aria-invalid={!!errors.password}
            className="bg-card"
            {...register("password")}
          />
          {errors.password?.message && (
            <p className="text-xs text-destructive">
              {t(errors.password.message)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="remember-me"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <label
            htmlFor="remember-me"
            className="cursor-pointer select-none text-sm text-muted-foreground"
          >
            {t("common:auth.remember_me")}
          </label>
        </div>

        {login.isError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            {rejectionMessage(login.error, t("common:auth.login_failed"))}
          </div>
        )}

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full rounded-full"
          disabled={login.isPending}
        >
          {login.isPending
            ? t("common:states.loading")
            : t("common:auth.sign_in")}
        </Button>
      </form>
    </AuthShell>
  );
}
