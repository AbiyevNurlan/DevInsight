import React, { useState } from 'react';
import { 
  Mic, Activity, TrendingUp, AlertCircle, 
  CheckCircle, Brain, Zap, Volume2
} from 'lucide-react';
import { analyzeVoiceEmotion } from '../../services/aiRecruitmentService';

interface EmotionTimepoint {
  secondMark: number;
  emotion: string;
  intensity: number;
  trigger: string;
}

interface VoiceAnalysisResult {
  dominantEmotion: string;
  confidenceScore: number;
  stressLevel: number;
  authenticityScore: number;
  engagementLevel: number;
  clarityScore: number;
  emotionBreakdown: Record<string, number>;
  speechPace: string;
  hasExcessiveFillers: boolean;
  fillerWordCount: number;
  hasLongPauses: boolean;
  averageResponseTime: number;
  emotionTimeline: EmotionTimepoint[];
  stressTrend: string;
  overallAssessment: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  interviewerTip: string;
}

const emotionColors: Record<string, string> = {
  CONFIDENT: 'bg-green-500',
  CALM: 'bg-blue-500',
  NEUTRAL: 'bg-gray-500',
  EXCITED: 'bg-yellow-500',
  NERVOUS: 'bg-orange-500',
  STRESSED: 'bg-red-500',
};

const VoiceEmotionPage: React.FC = () => {
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const runDemoAnalysis = async () => {
    setLoading(true);
    try {
      const response = await analyzeVoiceEmotion({
        candidateId: 1,
        interviewId: 1,
        transcript: "I have extensive experience with microservices architecture. In my previous role, I designed and implemented a distributed system handling over 10,000 requests per second. I utilized Docker and Kubernetes for container orchestration, and implemented circuit breaker patterns for resilience.",
        averagePitch: 168.5,
        pitchVariance: 22.3,
        speakingRate: 142.0,
        pauseFrequency: 4.2,
        averagePauseDuration: 1.1,
        volumeLevel: 0.65,
        volumeVariance: 0.12,
        totalDurationSeconds: 120,
        questionContext: "Tell me about your experience with distributed systems"
      });
      if (response.success) {
        setResult(response.data);
      }
    } catch {
      // Use mock data on error
      setResult({
        dominantEmotion: 'CONFIDENT',
        confidenceScore: 78,
        stressLevel: 25,
        authenticityScore: 82,
        engagementLevel: 74,
        clarityScore: 85,
        emotionBreakdown: { confident: 0.72, calm: 0.65, nervous: 0.12, excited: 0.15, stressed: 0.18 },
        speechPace: 'MODERATE',
        hasExcessiveFillers: false,
        fillerWordCount: 3,
        hasLongPauses: false,
        averageResponseTime: 2.1,
        emotionTimeline: [
          { secondMark: 0, emotion: 'NEUTRAL', intensity: 0.5, trigger: 'Start' },
          { secondMark: 30, emotion: 'CONFIDENT', intensity: 0.7, trigger: 'Familiar topic' },
          { secondMark: 60, emotion: 'CONFIDENT', intensity: 0.8, trigger: 'Technical detail' },
          { secondMark: 90, emotion: 'CALM', intensity: 0.65, trigger: 'Conclusion' },
        ],
        stressTrend: 'DECREASING',
        overallAssessment: 'Candidate demonstrates confident vocal patterns with strong engagement levels.',
        strengths: ['Clear articulation', 'Consistent pace', 'Good vocal projection'],
        concerns: ['Minor pitch variation on complex topics'],
        recommendations: ['Allow more time for deep technical explanations'],
        interviewerTip: 'Candidate is most confident discussing practical experience — steer toward project-based questions.'
      });
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar = ({ label, value, max = 100, color = 'blue' }: { label: string; value: number; max?: number; color?: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="font-semibold text-white">{value.toFixed(1)}/{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full bg-${color}-500`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <Mic className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Voice Emotion Analysis</h1>
            <p className="text-gray-400">Real-time voice stress & emotion detection during interviews</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              isRecording ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            <Volume2 className="w-4 h-4" /> {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <button 
            onClick={runDemoAnalysis} 
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Brain className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {!result ? (
        <div className="text-center py-20">
          <Mic className="w-20 h-20 text-purple-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl text-gray-300 mb-2">No Analysis Yet</h2>
          <p className="text-gray-500">Click "Run Analysis" to analyze voice emotion patterns</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Scores Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Dominant Emotion', value: result.dominantEmotion, icon: Brain, isText: true },
              { label: 'Confidence', value: result.confidenceScore, icon: Zap, color: 'green' },
              { label: 'Stress Level', value: result.stressLevel, icon: AlertCircle, color: result.stressLevel > 60 ? 'red' : 'yellow' },
              { label: 'Authenticity', value: result.authenticityScore, icon: CheckCircle, color: 'blue' },
              { label: 'Engagement', value: result.engagementLevel, icon: Activity, color: 'purple' },
              { label: 'Clarity', value: result.clarityScore, icon: TrendingUp, color: 'cyan' },
            ].map((metric, i) => (
              <div key={i} className="bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <metric.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">{metric.label}</span>
                </div>
                {metric.isText ? (
                  <div className={`text-lg font-bold text-white flex items-center gap-2`}>
                    <div className={`w-3 h-3 rounded-full ${emotionColors[metric.value as string] || 'bg-gray-500'}`} />
                    {metric.value as string}
                  </div>
                ) : (
                  <div className={`text-2xl font-bold text-${metric.color}-400`}>
                    {(metric.value as number).toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Emotion Breakdown */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" /> Emotion Breakdown
              </h3>
              {Object.entries(result.emotionBreakdown).map(([emotion, value]) => (
                <div key={emotion} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{emotion}</span>
                    <span className="text-white font-medium">{(value * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${emotionColors[emotion.toUpperCase()] || 'bg-blue-500'}`} 
                      style={{ width: `${value * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Voice Characteristics */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-400" /> Voice Characteristics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">Speech Pace</span>
                  <span className="text-white font-medium">{result.speechPace}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">Filler Words</span>
                  <span className={`font-medium ${result.hasExcessiveFillers ? 'text-red-400' : 'text-green-400'}`}>
                    {result.fillerWordCount} {result.hasExcessiveFillers ? '(Excessive)' : '(Normal)'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">Long Pauses</span>
                  <span className={`font-medium ${result.hasLongPauses ? 'text-yellow-400' : 'text-green-400'}`}>
                    {result.hasLongPauses ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">Avg Response Time</span>
                  <span className="text-white font-medium">{result.averageResponseTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Stress Trend</span>
                  <span className={`font-medium ${
                    result.stressTrend === 'DECREASING' ? 'text-green-400' : 
                    result.stressTrend === 'INCREASING' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{result.stressTrend}</span>
                </div>
              </div>
            </div>

            {/* Emotion Timeline */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" /> Emotion Timeline
              </h3>
              <div className="space-y-4">
                {result.emotionTimeline?.map((tp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${emotionColors[tp.emotion] || 'bg-gray-500'}`} />
                      {i < (result.emotionTimeline?.length || 0) - 1 && <div className="w-0.5 h-8 bg-gray-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{tp.emotion}</span>
                        <span className="text-gray-500 text-xs">{tp.secondMark}s</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{tp.trigger}</p>
                      <div className="w-20 bg-gray-700 rounded-full h-1 mt-1">
                        <div className={`h-1 rounded-full ${emotionColors[tp.emotion] || 'bg-blue-500'}`} style={{ width: `${tp.intensity * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interviewer Tip */}
          {result.interviewerTip && (
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Real-Time Interviewer Tip
              </h3>
              <p className="text-purple-100">{result.interviewerTip}</p>
            </div>
          )}

          {/* Assessment, Strengths, Concerns, Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Overall Assessment</h3>
              <p className="text-gray-300 leading-relaxed">{result.overallAssessment}</p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Strengths</h4>
                <ul className="space-y-1">{result.strengths.map((s, i) => <li key={i} className="text-gray-300 text-sm">• {s}</li>)}</ul>
              </div>
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Concerns</h4>
                <ul className="space-y-1">{result.concerns.map((c, i) => <li key={i} className="text-gray-300 text-sm">• {c}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceEmotionPage;
