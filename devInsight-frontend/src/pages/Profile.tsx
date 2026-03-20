import React, { useEffect, useState } from 'react'
import api from '../services/api'

interface UserDTO {
  id: number
  email: string
  fullName: string
  phone?: string
  role: string
  status: string
  avatarUrl?: string
  bio?: string
  linkedinUrl?: string
  githubUrl?: string
  skills?: string[]
}

export default function Profile() {
  const [profile, setProfile] = useState<UserDTO | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[Profile] Fetching user profile...')
    api.get('/users/me')
      .then(res => {
        console.log('[Profile] Success:', res.data)
        setProfile(res.data?.data)
      })
      .catch((err) => {
        console.error('[Profile] Error:', err.response?.data || err.message)
        setError(err.response?.data?.message || 'Failed to load profile')
      })
  }, [])

  if (error) return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">Error: {error}</p>
    </div>
  )

  if (!profile) return (
    <div className="max-w-xl mx-auto mt-8 p-6 text-center">
      <p className="text-gray-600">Loading...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto mt-8 relative">
      {/* Floating Depth Shadow & Glow */}
      <div className="absolute inset-0 bg-neon-cyan/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="glass-panel p-10 rounded-3xl relative overflow-hidden backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none mix-blend-screen"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">

          {/* Avatar Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-neon-cyan to-neon-purple rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse-slow"></div>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="relative w-32 h-32 rounded-full border-2 border-white/20 shadow-2xl object-cover" />
            ) : (
              <div className="relative w-32 h-32 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white text-5xl font-light shadow-2xl backdrop-blur-md">
                {profile.fullName.charAt(0)}
              </div>
            )}
            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-[#0f172a] shadow-[0_0_10px_rgba(34,197,94,0.6)] ${profile.status === 'ACTIVE' ? 'bg-neon-green animate-pulse' : 'bg-gray-500'}`}></div>
          </div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <div>
              <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4 mb-2">
                <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">{profile.fullName}</h2>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-neon-cyan text-xs font-bold uppercase tracking-[0.2em] rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  {profile.role}
                </span>
                {profile.status === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold uppercase tracking-[0.2em] rounded-full box-shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-[pulse_3s_ease-in-out_infinite]">
                    Active System
                  </span>
                )}
              </div>
              <p className="text-lg text-white/50 font-medium tracking-wide flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-blue"></span>
                {profile.email}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm hover:border-white/10 transition-colors">
              <div className="space-y-1">
                <p className="text-xs text-neon-cyan uppercase tracking-widest font-bold">Contact Phone</p>
                <p className="text-lg text-white font-medium">{profile.phone || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neon-cyan uppercase tracking-widest font-bold">Account Status</p>
                <p className="text-lg text-white font-medium flex items-center gap-2">
                  {profile.status}
                </p>
              </div>
            </div>

            {profile.bio && (
              <div className="space-y-2">
                <p className="text-xs text-neon-cyan uppercase tracking-widest font-bold">Biography</p>
                <p className="text-white/80 leading-relaxed font-light text-sm md:text-base border-l-2 border-neon-purple/50 pl-4">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-neon-cyan uppercase tracking-widest font-bold">Skill Matrix</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="bg-white/5 border border-white/10 text-white/90 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-white/10 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center md:justify-start gap-4 pt-4">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-bold text-sm tracking-wide shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  LINKEDIN ↗
                </a>
              )}
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg font-bold text-sm tracking-wide shadow-lg border border-white/10 hover:shadow-white/10 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  GITHUB ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
