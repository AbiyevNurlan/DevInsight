import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import api from '../services/api'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthorized' | 'forbidden'
  role: string | null
}

/**
 * Server-verified route guard.
 * Calls GET /users/me to validate the JWT and extract the real role
 * from the backend — localStorage values are never trusted.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const [auth, setAuth] = useState<AuthState>({ status: 'loading', role: null })

  useEffect(() => {
    let cancelled = false

    const verify = async () => {
      const token = api.getToken()
      if (!token) {
        if (!cancelled) setAuth({ status: 'unauthorized', role: null })
        return
      }

      try {
        const res = await api.get('/users/me')
        const role: string | undefined = res.data?.data?.role
        if (cancelled) return

        if (!role) {
          setAuth({ status: 'unauthorized', role: null })
          return
        }

        // Sync localStorage with the server-verified role
        api.setRole(role)

        if (allowedRoles.includes(role)) {
          setAuth({ status: 'authenticated', role })
        } else {
          setAuth({ status: 'forbidden', role })
        }
      } catch {
        if (!cancelled) {
          api.clearTokens()
          setAuth({ status: 'unauthorized', role: null })
        }
      }
    }

    verify()
    return () => { cancelled = true }
  }, [location.pathname, allowedRoles])

  if (auth.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (auth.status === 'unauthorized') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (auth.status === 'forbidden') {
    return <Navigate to="/forbidden" replace />
  }

  return <>{children}</>
}
