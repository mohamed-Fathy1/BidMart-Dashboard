import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

type Step = 'email' | 'code' | 'new-password' | 'confirm'

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('email')

  const steps: Record<Step, { title: string; next?: Step }> = {
    email: { title: 'Enter your email', next: 'code' },
    code: { title: 'Enter verification code', next: 'new-password' },
    'new-password': { title: 'Create new password', next: 'confirm' },
    confirm: { title: 'Password reset complete' },
  }

  const current = steps[step]

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">{current.title}</CardTitle>
          <div className="flex gap-1 pt-2">
            {(Object.keys(steps) as Step[]).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s === step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'email' && (
            <div className="space-y-2">
              <Label>{t('common:labels.email')}</Label>
              <Input type="email" placeholder="email@example.com" />
            </div>
          )}
          {step === 'code' && (
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input type="text" placeholder="000000" />
            </div>
          )}
          {step === 'new-password' && (
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" />
            </div>
          )}
          {step === 'confirm' && (
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully.
            </p>
          )}
          {current.next && (
            <Button className="w-full" onClick={() => setStep(current.next!)}>
              {t('common:buttons.submit')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
