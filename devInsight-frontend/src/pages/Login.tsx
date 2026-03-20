import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Check if redirected from protected route
  const from = (location.state as any)?.from?.pathname || '/'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }
    if (!password) {
      setError('Password is required')
      setLoading(false)
      return
    }

    try {
      console.log('[Login] Attempting login with email:', email.trim())
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password
      })

      console.log('[Login] Response received:', {
        success: res.data?.success,
        hasData: !!res.data?.data,
        hasToken: !!res.data?.data?.token,
        hasRefreshToken: !!res.data?.data?.refreshToken,
        role: res.data?.data?.role
      })

      const data = res.data?.data
      const token = data?.token
      const refreshToken = data?.refreshToken
      const role = data?.role

      // Check for required tokens
      if (!token) {
        console.error('[Login] No access token received from server')
        setError('Login failed: No access token received. Please try again.')
        setLoading(false)
        return
      }

      // Store tokens securely
      api.setToken(token)
      console.log('[Login] Access token stored')

      if (refreshToken) {
        api.setRefreshToken(refreshToken)
        console.log('[Login] Refresh token stored')
      } else {
        console.warn('[Login] No refresh token received - session may expire without renewal')
      }

      // Store role
      if (role) {
        api.setRole(role)
        console.log('[Login] Role stored:', role)
      } else {
        console.warn('[Login] No role received from server')
      }

      console.log('[Login] Login successful, user role:', role)

      // Role-based redirect
      let redirectPath = from
      if (role === 'ADMIN') {
        redirectPath = '/admin'
        console.log('[Login] Redirecting ADMIN to admin dashboard')
      } else if (role === 'HR') {
        redirectPath = '/hr/dashboard'
        console.log('[Login] Redirecting HR to HR dashboard')
      } else if (role === 'COMPANY') {
        redirectPath = '/interviews'
        console.log('[Login] Redirecting COMPANY to interviews')
      } else if (role === 'CANDIDATE') {
        redirectPath = '/candidate/dashboard'
        console.log('[Login] Redirecting CANDIDATE to candidate dashboard')
      } else {
        redirectPath = '/dashboard'
        console.log('[Login] Redirecting to default dashboard')
      }

      navigate(redirectPath, { replace: true })
    } catch (err: any) {
      console.error('[Login] Login failed:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      })

      if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.')
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid request. Please check your input.')
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and ensure the server is running.')
      } else if (!err.response) {
        setError('Unable to connect to server. Please try again.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 font-light">Sign in to your DevInsight workspace</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl overflow-hidden p-1">
          <div className="px-6 sm:px-8 py-8 sm:py-10 bg-zinc-950/40">

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-white/5 border-l-2 border-white/40 rounded-r-lg">
                <p className="text-sm font-medium text-white">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white placeholder:text-zinc-700 font-light"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white placeholder:text-zinc-700 font-light"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3 px-4 rounded-full transition-all duration-300 hover:bg-zinc-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-zinc-400 border-t-black rounded-full"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-2 bg-black text-zinc-600">New to DevInsight?</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-zinc-500 font-light">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="font-medium text-white hover:underline transition-all"
                >
                  Create one now
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-8 font-light">
          Protected by industry-standard security
        </p>
      </div>
    </div>
  )
}
