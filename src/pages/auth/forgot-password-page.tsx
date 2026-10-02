import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react'
import {
  AuthCard,
  AuthErrorAlert,
  AuthSuccessAlert,
  FormField,
} from '@/components/auth'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import type { ForgotPasswordFields } from '@/lib/validations/auth'
import { authService, isAuthServiceError } from '@/services'

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function onSubmit(values: ForgotPasswordFields) {
    setSubmitError(null)
    try {
      await authService.requestPasswordReset(values.email)
      setSubmittedEmail(values.email)
    } catch (error) {
      setSubmitError(
        isAuthServiceError(error)
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  if (submittedEmail) {
    return (
      <AuthCard>
        <CardHeader>
          <CardTitle className="text-xl">Check your inbox</CardTitle>
          <CardDescription>
            Reset request for{' '}
            <span className="font-medium text-foreground">
              {submittedEmail}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthSuccessAlert title="Request received">
            If an account exists for this email, a password reset link would
            be sent to it. This is a frontend demo flow — no email was
            actually sent, and no change is possible yet.
          </AuthSuccessAlert>
          <Button asChild className="w-full">
            <Link to="/login">
              <ArrowLeft aria-hidden="true" />
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter the email linked to your account and we will guide you
          through the next step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {submitError ? (
            <AuthErrorAlert title="Request failed">{submitError}</AuthErrorAlert>
          ) : null}

          <FormField
            id="email"
            label="Email"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@caregrid.io"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Mail aria-hidden="true" />
            )}
            {isSubmitting ? 'Submitting...' : 'Send reset instructions'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link
            to="/login"
            className="font-medium text-primary outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </AuthCard>
  )
}