import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/features/auth/auth.store";
import { useUpdateAdminProfileMutation } from "@/features/auth/auth.queries";
import { accountInitials } from "@/lib/utils";

const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "profile:errors.full_name_required" }),
  email: z.string().email({ message: "common:auth.invalid_email" }),
  phone: z.string().trim().optional(),
});

type ProfileForm = z.infer<typeof profileFormSchema>;

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateAdminProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      fullName: user.name,
      email: user.email,
      phone: user.phone ?? "",
    });
  }, [user, reset]);

  function onSubmit(data: ProfileForm) {
    const phone = data.phone?.trim() ? data.phone.trim() : null;
    updateProfile.mutate({
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone,
    });
  }

  const roleLabel =
    i18n.language === "ar"
      ? (user?.roleNameAr ?? user?.roleNameEn ?? "—")
      : (user?.roleNameEn ?? user?.roleNameAr ?? "—");

  const initials = accountInitials(user?.name, user?.email);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <PageHeader
        title={t("profile:title")}
        description={t("profile:description")}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] lg:items-start">
        <Card className="shadow-rest lg:sticky lg:top-4">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <Avatar
                size="lg"
                className="size-16 shrink-0 rounded-xl data-[size=lg]:size-16"
              >
                <AvatarFallback className="rounded-xl bg-muted text-lg font-semibold text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-center sm:text-start">
                <p className="text-lg font-semibold leading-snug tracking-tight text-foreground">
                  {user?.name ?? "—"}
                </p>
                {user?.email ? (
                  <p className="mt-1.5 break-all font-mono text-xs leading-relaxed tabular-nums text-muted-foreground">
                    {user.email}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="outline" className="max-w-full font-normal">
                    <span className="truncate">{roleLabel}</span>
                  </Badge>
                  {user?.isSuperAdmin ? (
                    <Badge className="shrink-0">{t("profile:badges.super_admin")}</Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-pretty text-center text-xs leading-relaxed text-muted-foreground sm:text-start">
              {t("profile:sections.role_managed_hint")}
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0 shadow-rest">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">{t("profile:sections.editable")}</CardTitle>
            <CardDescription className="text-pretty">
              {t("profile:sections.editable_hint")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form
              className="space-y-6"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="profile-fullName">{t("profile:fields.full_name")}</Label>
                  <Input
                    id="profile-fullName"
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    className="rounded-md"
                    {...register("fullName")}
                  />
                  {errors.fullName?.message ? (
                    <p className="text-xs text-destructive">
                      {t(errors.fullName.message)}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="profile-phone">{t("profile:fields.phone")}</Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    placeholder={t("profile:fields.phone_placeholder")}
                    className="rounded-md font-mono tabular-nums"
                    {...register("phone")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("profile:fields.phone_helper")}
                  </p>
                  {errors.phone?.message ? (
                    <p className="text-xs text-destructive">{t(errors.phone.message)}</p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="profile-email">{t("common:labels.email")}</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className="rounded-md font-mono tabular-nums"
                    {...register("email")}
                  />
                  {errors.email?.message ? (
                    <p className="text-xs text-destructive">{t(errors.email.message)}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending || !isDirty}
                  className="min-w-30"
                >
                  {t("profile:actions.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isDirty || updateProfile.isPending}
                  onClick={() =>
                    user &&
                    reset({
                      fullName: user.name,
                      email: user.email,
                      phone: user.phone ?? "",
                    })
                  }
                >
                  {t("common:buttons.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
