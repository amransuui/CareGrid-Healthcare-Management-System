import { createBrowserRouter } from 'react-router-dom'
import { appRoutes } from '@/routes/app'
import { publicRoutes } from '@/routes/public'

export const router = createBrowserRouter([...publicRoutes, ...appRoutes])