import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useLoginMutation } from "@/features/auth/auth.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LangSwitcher } from "@/components/layout/lang-switcher";
import { PasswordInput } from "@/components/shared/password-input";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email({ message: "common:auth.invalid_email" }),
  password: z.string().min(6, { message: "common:auth.password_min" }),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const { t } = useTranslation();
  const login = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  function onSubmit(data: LoginForm) {
    login.mutate(data);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="absolute top-4 end-4">
        <LangSwitcher />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src="/brandmark.svg"
            alt="BidMart"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("common:auth.sign_in")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("common:auth.sign_in_subtitle")}
            </p>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-raised)]">
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
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
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password?.message && (
                  <p className="text-xs text-destructive">
                    {t(errors.password.message)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember-me" {...register("rememberMe")} />
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
                  {t("common:auth.login_failed")}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending
                  ? t("common:states.loading")
                  : t("common:auth.sign_in")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
