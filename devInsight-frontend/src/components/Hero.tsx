import React from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Hero(){
  const navigate = useNavigate()
  const isLoggedIn = !!api.getToken()

  return (
    <section className="relative overflow-hidden pt-6 md:pt-10">
      {/* Background layers */}
      <div className="hero-orbit" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <span className="sparkle-pulse left-1/4 top-1/4" />
      <span className="sparkle-pulse right-1/3 bottom-10" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Content */}
          <div className="space-y-7">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 metric-chip bg-slate-900/80 border border-sky-500/40 shadow-lg shadow-sky-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
                <span className="text-[0.68rem] tracking-[0.25em] uppercase text-slate-200/80">
                  Realtime Hiring Intelligence
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight md:leading-[1.05] tracking-tight">
                <span className="block text-slate-100/90">
                  Design interviews
                </span>
                <span className="mt-1 inline-block bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                  that feel like products
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300/80 max-w-xl leading-relaxed">
                DevInsight turns your interview pipeline into an immersive control center&nbsp;—
                live signals, rich candidate journeys, and deep technical assessments in one
                luminous, focused workspace.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="btn-primary-neo px-7 py-3 text-sm md:text-[0.9rem] font-semibold"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-primary-neo px-8 py-3 text-sm md:text-[0.9rem] font-semibold"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-soft px-8 py-3 text-sm md:text-[0.9rem] font-semibold"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
              <div>
                <p className="text-2xl sm:text-3xl font-semibold text-sky-300 metric-value">
                  500+
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Interview Questions</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-semibold text-indigo-300 metric-value">
                  10K+
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Candidates Assessed</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-semibold text-fuchsia-300 metric-value">
                  4.8★
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Session Experience Score</p>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 glass-panel rounded-3xl opacity-90" />
            <div className="relative h-full flex items-center justify-center p-5 md:p-7">
              <div className="space-y-4 w-full subtle-scroll-fade">
                {/* Card 1 */}
                <div className="glass-panel p-4 md:p-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-500/15 flex items-center justify-center border border-sky-400/40">
                      <span className="text-xl">💻</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-50 text-sm md:text-base">Deep technical signal</p>
                      <p className="text-xs md:text-sm text-slate-400/90">Advanced questions, structured scoring, automatic summaries.</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="glass-panel p-4 md:p-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-400/40">
                      <span className="text-xl">📊</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-50 text-sm md:text-base">Live pipelines</p>
                      <p className="text-xs md:text-sm text-slate-400/90">Track every interview as it flows through your funnel.</p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="glass-panel p-4 md:p-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-fuchsia-500/15 flex items-center justify-center border border-fuchsia-400/40">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-50 text-sm md:text-base">Immersive experience</p>
                      <p className="text-xs md:text-sm text-slate-400/90">An interface designed to keep hiring teams in flow state.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
