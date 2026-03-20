import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('CANDIDATE')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Client-side validation
    if (!fullName.trim()) {
      setError('Full name is required')
      setLoading(false)
      return
    }
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters')
      setLoading(false)
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    if (!password) {
      setError('Password is required')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (!role) {
      setError('Please select your role')
      setLoading(false)
      return
    }

    try {
      const registerData = {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        ...(phone && { phone: phone.trim() })
      }

      console.log('[Register] Sending data:', registerData)
      const res = await api.post('/auth/register', registerData)

      const token = res.data?.data?.token
      const userRole = res.data?.data?.role
      if (token) {
        api.setToken(token)
        if (userRole) {
          api.setRole(userRole)
        }
        navigate('/')
      }
    } catch (err: any) {
      console.error('[Register] Error:', err.response?.data || err.message)

      if (err.response?.data?.fieldErrors) {
        const fieldErrors = err.response.data.fieldErrors
        const firstError = Object.values(fieldErrors)[0]
        setError(Array.isArray(firstError) ? (firstError as string[])[0] : String(firstError))
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.status === 400) {
        setError('Please check your input and try again')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Create Your Account</h1>
          <p className="text-zinc-500 font-light">Join DevInsight and start your journey</p>
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
            <form onSubmit={submit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white placeholder:text-zinc-700 font-light"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white placeholder:text-zinc-700 font-light"
                  placeholder="john@example.com"
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
                  Password * (minimum 6 characters)
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white placeholder:text-zinc-700 font-light"
                    placeholder="••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white placeholder:text-zinc-700 font-light"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                    I am a *
                  </label>
                  <select
                    id="role"
                    className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white font-light"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    disabled={loading}
                    required
                  >
                    <option value="CANDIDATE" className="bg-black">Job Candidate</option>
                    <option value="COMPANY" className="bg-black">Company/Recruiter</option>
                  </select>
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
                    Phone (Optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all bg-black/20 text-white placeholder:text-zinc-700 font-light"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-white text-black font-semibold py-3 px-4 rounded-full transition-all duration-300 hover:bg-zinc-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-zinc-400 border-t-black rounded-full"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-2 bg-black text-zinc-600">Already registered?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-zinc-500 font-light">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-medium text-white hover:underline transition-all"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-8 font-light">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
