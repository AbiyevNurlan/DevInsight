import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Interview {
  id: number;
  templateName: string;
  status: string;
  scheduledDate: string;
  score: number;
  submittedAt: string;
  duration: number;
}

interface Submission {
  id: number;
  interviewId: number;
  score: number;
  feedback: string;
  submittedAt: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  unlockedAt: string;
  badge: string;
}

export const CandidateDashboard: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    bestScore: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [interviewsRes, submissionsRes, achievementsRes] = await Promise.all([
        api.get('/candidate/interviews'),
        api.get('/candidate/submissions'),
        api.get('/candidate/achievements'),
      ]);

      setInterviews(interviewsRes.data);
      setSubmissions(submissionsRes.data);
      setAchievements(achievementsRes.data);

      // Calculate stats
      const completed = interviewsRes.data.filter(
        (i: Interview) => i.status === 'COMPLETED'
      ).length;
      const scores = interviewsRes.data
        .filter((i: Interview) => i.score !== null)
        .map((i: Interview) => i.score);
      const avgScore = scores.length > 0
        ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        : 0;

      setStats({
        totalInterviews: interviewsRes.data.length,
        completedInterviews: completed,
        averageScore: parseFloat(avgScore.toFixed(2)),
        bestScore: Math.max(...scores, 0),
      });
    } catch (error) {
      console.error('Error loading data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (interviewId: number) => {
    try {
      const response = await api.post(`/candidate/interviews/${interviewId}/start`, {});
      window.location.href = `/interview/${response.data.sessionId}`;
    } catch (error) {
      console.error('Error starting interview', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
      case 'IN_PROGRESS':
        return 'bg-white text-black border border-white';
      case 'COMPLETED':
        return 'bg-white/10 text-white border border-white/20';
      case 'REJECTED':
        return 'bg-zinc-900 text-zinc-500 border border-zinc-800';
      default:
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    }
  };

  return (
    <div className="space-y-8 p-8 bg-transparent min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Candidate Dashboard</h1>
        <p className="text-zinc-500 mt-1 font-medium">Track your interview progress and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">Total Interviews</div>
          <div className="text-3xl font-light text-white tracking-tight">{stats.totalInterviews}</div>
        </div>

        <div className="glass-card p-6">
          <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">Completed</div>
          <div className="text-3xl font-light text-white tracking-tight">
            {stats.completedInterviews}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">Average Score</div>
          <div className="text-3xl font-light text-white tracking-tight">
            {stats.averageScore.toFixed(1)}%
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">Best Score</div>
          <div className="text-3xl font-light text-white tracking-tight">{stats.bestScore}%</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interviews List */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6 tracking-tight">My Interviews</h2>

            {interviews.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-white/5 rounded-xl">
                No interviews scheduled yet
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => setSelectedInterview(interview)}
                    className={`p-5 border rounded-xl cursor-pointer transition-all duration-300 ${selectedInterview?.id === interview.id
                      ? 'bg-white/10 border-white/10 shadow-lg'
                      : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-white text-lg tracking-tight">
                        {interview.templateName}
                      </h3>
                      <span
                        className={`px-2.5 py-1 text-[10px] rounded-full uppercase tracking-wider font-bold ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500 mb-4 font-medium">
                      <div>Date: {new Date(interview.scheduledDate).toLocaleDateString()}</div>
                      <div>Duration: {interview.duration}m</div>
                    </div>

                    {interview.score !== null && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-wider font-bold text-zinc-500">
                          <span>Score</span>
                          <span className="text-white">
                            {interview.score}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1">
                          <div
                            className="bg-white h-1 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{ width: `${interview.score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {interview.status === 'SCHEDULED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartInterview(interview.id);
                        }}
                        className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-white/10"
                      >
                        Start Interview
                      </button>
                    )}

                    {interview.status === 'COMPLETED' && interview.submittedAt && (
                      <div className="text-[10px] text-zinc-600 font-mono">
                        Submitted: {new Date(interview.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements Sidebar */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6 tracking-tight">Achievements</h2>

          {achievements.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm italic">
              Complete interviews to unlock achievements
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="text-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="text-2xl mb-2 filter grayscale brightness-125 opacity-80">{achievement.badge}</div>
                  <div className="text-xs font-bold text-zinc-300 mb-1">
                    {achievement.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interview Details */}
      {selectedInterview && (
        <div className="glass-card p-6 h-fit">
          <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">
            Interview Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">Status</div>
              <div className="text-lg">
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedInterview.status)}`}>
                  {selectedInterview.status}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">Scheduled</div>
              <div className="text-lg font-medium text-white tracking-tight">
                {new Date(selectedInterview.scheduledDate).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">Duration</div>
              <div className="text-lg font-medium text-white tracking-tight">
                {selectedInterview.duration} min
              </div>
            </div>

            {selectedInterview.score !== null && (
              <div className="col-span-1 md:col-span-3">
                <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">Your Score</div>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-light text-white tracking-tighter">
                    {selectedInterview.score}%
                  </div>
                  <div className="flex-1 h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      style={{ width: `${selectedInterview.score}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedInterview.status === 'SCHEDULED' && (
            <button
              onClick={() => handleStartInterview(selectedInterview.id)}
              className="mt-8 px-8 py-4 w-full bg-white text-black rounded-xl font-bold text-lg uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-xl shadow-white/10"
            >
              Start Interview Now
            </button>
          )}
        </div>
      )}
    </div>
  );
};
