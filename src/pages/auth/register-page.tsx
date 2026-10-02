import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { CircleAlert, LoaderCircle, UserPlus } from 'lucide-react'
import {
  AuthCard,
  AuthErrorAlert,
  FormField,
  PasswordInput,
  PasswordRequirements,
  PasswordStrength,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { roleLabels } from '@/data/mock/demo-users'
import { registerSchemaWithConfirm } from '@/lib/validations/auth'
import type { RegisterFields } from '@/lib/validations/auth'
import { authService, isAuthServiceError } from '@/services'
import { useAuthStore } from '@/store/use-auth-store'
import { USER_ROLES } from '@/types/auth'
import type { UserRole } from '@/types/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchemaWithConfirm),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: '' as UserRole,
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const password = watch('password')

  async function onSubmit(values: RegisterFields) {
    setSubmitError(null)
    try {
      const session = await authService.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        password: values.password,
      })
      setSession(session)
      navigate('/app', { replace: true })
    } catch (error) {
      setSubmitError(
        isAuthServiceError(error)
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <AuthCard className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>
          Set up a role-based workspace in under a minute.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {submitError ? (
            <AuthErrorAlert title="Unable to create account">
              {submitError}
            </AuthErrorAlert>
          ) : null}

          <FormField
            id="fullName"
            label="Full name"
            required
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="e.g. Dr. Ayesha Rahman"
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              {...register('fullName')}
            />
          </FormField>

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
            id="phone"
            label="Phone number"
            required
            error={errors.phone?.message}
            hint="Digits only, with optional + or spaces (e.g. +8801712345678)"
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+8801712345678"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={
                errors.phone ? 'phone-error' : 'phone-hint'
              }
              {...register('phone')}
            />
          </FormField>

          <FormField
            id="role"
            label="Your role"
            required
            error={errors.role?.message}
          >
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="role"
                    className="w-full"
                    aria-invalid={errors.role ? true : undefined}
                    aria-describedby={errors.role ? 'role-error' : undefined}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
              autoComplete="new-password"
              placeholder="Create a strong password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
          </FormField>

          <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
            <PasswordStrength value={password} />
            <PasswordRequirements value={password} />
          </div>

          <FormField
            id="confirmPassword"
            label="Confirm password"
            required
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={errors.confirmPassword ? true : undefined}
              aria-describedby={
                errors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              {...register('confirmPassword')}
            />
          </FormField>

          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  aria-invalid={errors.terms ? true : undefined}
                  aria-describedby={errors.terms ? 'terms-error' : undefined}
                />
                <div>
                  <Label
                    htmlFor="terms"
                    className="text-xs leading-relaxed font-normal text-muted-foreground"
                  >
                    I accept the{' '}
                    <span className="font-medium text-foreground">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="font-medium text-foreground">
                      Privacy Policy
                    </span>
                    .
                  </Label>
                  {errors.terms ? (
                    <p
                      id="terms-error"
                      className="flex items-start gap-1 text-xs font-medium text-destructive"
                    >
                      <CircleAlert
                        className="mt-px size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{errors.terms.message}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus aria-hidden="true" />
            )}
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Frontend demo only — this does not create a real account or store
          your information.
        </p>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <Separator />
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </AuthCard>
  )
}