import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useLoginMutation } from '@/features/auth/auth.queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LangSwitcher } from '@/components/layout/lang-switcher'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginPage() {
  const { t } = useTranslation()
  const login = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  function onSubmit(data: LoginForm) {
    login.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="absolute top-4 end-4">
        <LangSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">BidMart</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common:labels.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', { required: true })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('common:labels.password', 'Password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { required: true })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? t('common:states.loading') : t('common:buttons.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
