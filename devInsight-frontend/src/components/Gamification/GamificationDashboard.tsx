import React, { useEffect, useState } from 'react'
import api from '../../services/api'

interface Badge {
  id: number
  code: string
  name: string
  description: string
  iconUrl: string
  pointsValue: number
  category: string
  rarity: string
}

interface UserBadge {
  id: number
  badge: Badge
  earnedAt: string
}

interface GamificationProfile {
  totalPoints: number
  level: number
  currentLevelPoints: number
  pointsToNextLevel: number
  interviewsCompleted: number
  perfectScores: number
  currentStreak: number
  longestStreak: number
  rank: number
  badges: UserBadge[]
}

interface LeaderboardEntry {
  userId: number
  userName: string
  avatarUrl: string | null
  totalPoints: number
  level: number
  interviewsCompleted: number
}

const GamificationDashboard: React.FC = () => {
  const [profile, setProfile] = useState<GamificationProfile | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard'>('overview')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileRes, leaderboardRes, badgesRes] = await Promise.all([
        api.get('/gamification/profile'),
        api.get('/gamification/leaderboard?limit=10'),
        api.get('/gamification/badges')
      ])
      setProfile(profileRes.data)
      setLeaderboard(leaderboardRes.data)
      setAllBadges(badgesRes.data)
    } catch (error) {
      console.error('Failed to load gamification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 'text-yellow-500 bg-yellow-100'
      case 'EPIC': return 'text-purple-500 bg-purple-100'
      case 'RARE': return 'text-blue-500 bg-blue-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  const getLevelProgress = () => {
    if (!profile) return 0
    const total = profile.currentLevelPoints + profile.pointsToNextLevel
    return (profile.currentLevelPoints / total) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-80">Total Points</div>
          <div className="text-3xl font-bold">{profile?.totalPoints || 0}</div>
          <div className="text-sm mt-2">Level {profile?.level || 1}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-80">Interviews</div>
          <div className="text-3xl font-bold">{profile?.interviewsCompleted || 0}</div>
          <div className="text-sm mt-2">{profile?.perfectScores || 0} perfect scores</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-80">Current Streak</div>
          <div className="text-3xl font-bold">{profile?.currentStreak || 0} 🔥</div>
          <div className="text-sm mt-2">Best: {profile?.longestStreak || 0} days</div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white">
          <div className="text-sm opacity-80">Global Rank</div>
          <div className="text-3xl font-bold">#{profile?.rank || '-'}</div>
          <div className="text-sm mt-2">{profile?.badges.length || 0} badges earned</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Level {profile?.level || 1}</span>
          <span className="text-gray-500">
            {profile?.currentLevelPoints || 0} / {(profile?.currentLevelPoints || 0) + (profile?.pointsToNextLevel || 100)} XP
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${getLevelProgress()}%` }}
          />
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {profile?.pointsToNextLevel || 100} points to next level
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'badges', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Badges */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Recent Badges</h3>
            {profile?.badges.length === 0 ? (
              <p className="text-gray-500">No badges earned yet. Complete interviews to earn badges!</p>
            ) : (
              <div className="space-y-3">
                {profile?.badges.slice(0, 5).map((ub) => (
                  <div key={ub.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-2xl">{ub.badge.iconUrl}</span>
                    <div>
                      <div className="font-medium">{ub.badge.name}</div>
                      <div className="text-sm text-gray-500">{ub.badge.description}</div>
                    </div>
                    <span className={`ml-auto px-2 py-1 rounded text-xs ${getRarityColor(ub.badge.rarity)}`}>
                      {ub.badge.rarity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interviews Completed</span>
                <span className="font-semibold">{profile?.interviewsCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Perfect Scores</span>
                <span className="font-semibold">{profile?.perfectScores || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Streak</span>
                <span className="font-semibold">{profile?.currentStreak || 0} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Badges Earned</span>
                <span className="font-semibold">{profile?.badges.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">All Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allBadges.map((badge) => {
              const earned = profile?.badges.some(ub => ub.badge.id === badge.id)
              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    earned 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="text-3xl text-center mb-2">{badge.iconUrl}</div>
                  <div className="font-medium text-center">{badge.name}</div>
                  <div className="text-xs text-gray-500 text-center mt-1">{badge.description}</div>
                  <div className={`text-center mt-2 px-2 py-1 rounded text-xs ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity} • +{badge.pointsValue} pts
                  </div>
                  {earned && (
                    <div className="text-center mt-2 text-green-600 text-sm">✓ Earned</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Global Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-gray-200'
                }`}>
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {entry.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{entry.userName}</div>
                  <div className="text-sm text-gray-500">
                    Level {entry.level} • {entry.interviewsCompleted} interviews
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600">{entry.totalPoints.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GamificationDashboard
