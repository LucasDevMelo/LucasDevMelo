import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Spinner } from '@/components/ui'
import { Landing } from '@/pages/Landing'
import { Checkout } from '@/pages/Checkout'
import { Welcome } from '@/pages/Welcome'
import { Profile } from '@/pages/Profile'
import { Ranking } from '@/pages/Ranking'
import { Join } from '@/pages/Join'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { Privacy, Terms } from '@/pages/Legal'

// Area logada e admin ficam fora do bundle inicial: quem chega do TikTok
// nunca precisa baixar esse codigo.
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Admin = lazy(() => import('@/pages/Admin').then((m) => ({ default: m.Admin })))

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="welcome" element={<Welcome />} />
        <Route path="join" element={<Join />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="login" element={<Login />} />
        <Route path="u/:username" element={<Profile />} />
        <Route path="termos" element={<Terms />} />
        <Route path="privacidade" element={<Privacy />} />

        <Route
          path="dashboard"
          element={
            <Suspense fallback={<PageSpinner />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="admin"
          element={
            <Suspense fallback={<PageSpinner />}>
              <Admin />
            </Suspense>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function PageSpinner() {
  return (
    <div className="grid min-h-[50dvh] place-items-center">
      <Spinner className="h-6 w-6 text-gold-300" />
    </div>
  )
}
