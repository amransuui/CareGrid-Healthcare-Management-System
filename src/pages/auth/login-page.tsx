import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LoaderCircle, LogIn, Sparkles } from 'lucide-react'
import {
  AuthCard,
  AuthErrorAlert,
  FormField,
  PasswordInput,
} from '@/components/auth'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  DEFAULT_DEMO_USER_EMAIL,
  DEMO_PASSWORD,
} from '@/data/mock/demo-users'
import { loginSchema } from '@/lib/validations/auth'
import type { LoginFields } from '@/lib/validations/auth'
import { authService, isAuthServiceError } from '@/services'
import { useAuthStore } from '@/store/use-auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const from =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/app'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const emailValue = watch('email')
  const passwordValue = watch('password')

  // Clear any failed-submit message as soon as the user starts typing again.
  useEffect(() => {
    setSubmitError(null)
  }, [emailValue, passwordValue])

  async function onSubmit(values: LoginFields) {
    setSubmitError(null)
    try {
      const session = await authService.login({
        email: values.email,
        password: values.password,
        remember: values.remember,
      })
      setSession(session)
      navigate(from, { replace: true })
    } catch (error) {
      setSubmitError(
        isAuthServiceError(error)
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  function fillDemoCredentials() {
    setValue('email', DEFAULT_DEMO_USER_EMAIL, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          Access your role-based CareGrid.io workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {submitError ? (
            <AuthErrorAlert title="Sign in failed">{submitError}</AuthErrorAlert>
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

          <FormField
            id="password"
            label="Password"
            required
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
          </FormField>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={watch('remember')}
                onCheckedChange={(checked) =>
                  setValue('remember', checked === true)
                }
              />
              <Label
                htmlFor="remember"
                className="text-xs font-normal text-muted-foreground"
              >
                Remember me for 30 days
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="rounded-sm text-xs font-medium text-primary outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <LogIn aria-hidden="true" />
            )}
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-4 rounded-lg border bg-muted/30 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Demo access
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Preview with a fictional account:
            <span className="font-medium text-foreground">
              {' '}
              {DEFAULT_DEMO_USER_EMAIL}
            </span>
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={fillDemoCredentials}
          >
            Fill demo credentials
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Demo sign-in only — no real credentials are stored or sent anywhere.
        </p>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <Separator />
        <p className="text-sm text-muted-foreground">
          New to CareGrid.io?{' '}
          <Link
            to="/register"
            className="font-medium text-primary outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create Account
          </Link>
        </p>
      </CardFooter>
    </AuthCard>
  )
}