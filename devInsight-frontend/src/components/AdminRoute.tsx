import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import api from '../services/api'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Protected route component that only allows ADMIN users.
 * Redirects to /forbidden if user is not an admin.
 * Redirects to /login if user is not logged in.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)
  
  const token = api.getToken()
  const refreshToken = api.getRefreshToken()
  const role = api.getRole()
  const isLoggedIn = !!token
  const isAdmin = api.isAdmin()

  useEffect(() => {
    console.log('[AdminRoute] Checking access for path:', location.pathname)
    console.log('[AdminRoute] Auth state:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      role: role,
      isAdmin: isAdmin
    })
    setIsChecking(false)
  }, [token, refreshToken, role, isAdmin, location.pathname])

  // Show loading while checking (prevents flash)
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    console.log('[AdminRoute] Not logged in - redirecting to login')
    // Save intended destination for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    console.log('[AdminRoute] User is not ADMIN (role:', role, ') - redirecting to forbidden')
    return <Navigate to="/forbidden" replace />
  }

  console.log('[AdminRoute] Access granted for ADMIN user')
  // User is admin - render the protected content
  return <>{children}</>
}
