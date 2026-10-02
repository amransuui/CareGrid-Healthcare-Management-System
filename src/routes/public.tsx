import type { RouteObject } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/auth-layout'
import { RedirectIfAuthenticated } from '@/routes/guards'
import { PublicLayout } from '@/layouts/public-layout'
import { LoginPage } from '@/pages/auth/login-page'
import { RegisterPage } from '@/pages/auth/register-page'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password-page'
import { LandingPage } from '@/pages/public/landing-page'
import { NotFoundPage } from '@/pages/public/not-found-page'

/**
 * Public routes.
 *
 * The landing page keeps its full chrome (Header/Footer) with anchor
 * navigation intact. Auth pages use their own focused layout and redirect
 * authenticated visitors straight to `/app`.
 */
export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <AuthLayout />
      </RedirectIfAuthenticated>
    ),
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/register',
    element: (
      <RedirectIfAuthenticated>
        <AuthLayout />
      </RedirectIfAuthenticated>
    ),
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: '/forgot-password',
    element: (
      <RedirectIfAuthenticated>
        <AuthLayout />
      </RedirectIfAuthenticated>
    ),
    children: [{ index: true, element: <ForgotPasswordPage /> }],
  },
]