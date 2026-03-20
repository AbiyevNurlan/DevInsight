import React, { useState } from 'react';
import { 
  Rocket, TrendingUp, Brain, Award, Target, 
  BookOpen, BarChart3, Star, Zap, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { analyzeCandidatePotential } from '../../services/aiRecruitmentService';

interface PotentialResult {
  growthPotentialScore: number;
  potentialLevel: string;
  predictedPerformance6Mo: number;
  predictedPerformance1Yr: number;
  learningSpeed: number;
  learningStyle: string;
  showsRapidImprovement: boolean;
  hintUtilizationScore: number;
  adaptabilityScore: number;
  problemSolvingCreativity: number;
  unfamiliarTopicHandling: number;
  predictedTrajectory: string;
  highPotentialAreas: string[];
  developmentAreas: string[];
  estimatedTimeToSenior: number;
  percentileRank: number;
  dimensionScores: Record<string, number>;
  executiveSummary: string;
  keyStrengths: string[];
  investmentRisks: string[];
  hiringRecommendation: string;
  reasoning: string;
}

const potentialColors: Record<string, string> = {
  EXCEPTIONAL: 'text-purple-400 bg-purple-900/30 border-purple-500/30',
  HIGH: 'text-green-400 bg-green-900/30 border-green-500/30',
  MODERATE: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
  LIMITED: 'text-red-400 bg-red-900/30 border-red-500/30',
};

const recommendationColors: Record<string, string> = {
  STRONG_HIRE: 'text-green-400 bg-green-900/40',
  HIRE: 'text-blue-400 bg-blue-900/40',
  BORDERLINE: 'text-yellow-400 bg-yellow-900/40',
  PASS: 'text-red-400 bg-red-900/40',
};

const CandidatePotentialPage: React.FC = () => {
  const [result, setResult] = useState<PotentialResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDemoAnalysis = async () => {
    setLoading(true);
    try {
      const response = await analyzeCandidatePotential({
        candidateId: 1,
        interviewId: 1,
        currentRole: 'Junior Developer',
        yearsExperience: 2,
        currentSkills: ['Java', 'Spring Boot', 'SQL', 'REST APIs'],
        educationLevel: 'Bachelor CS',
        targetPosition: 'Mid-level Backend Developer',
        performances: [
          { questionType: 'TECHNICAL', difficulty: 5, score: 72, timeTakenSeconds: 300, usedHints: true, hintCount: 1, improvedAfterHint: true, approach: 'Systematic' },
          { questionType: 'TECHNICAL', difficulty: 7, score: 68, timeTakenSeconds: 480, usedHints: true, hintCount: 2, improvedAfterHint: true, approach: 'Trial and error then systematic' },
          { questionType: 'BEHAVIORAL', difficulty: 5, score: 85, timeTakenSeconds: 180, usedHints: false, hintCount: 0, improvedAfterHint: false, approach: 'STAR method' },
          { questionType: 'TECHNICAL', difficulty: 8, score: 55, timeTakenSeconds: 600, usedHints: true, hintCount: 3, improvedAfterHint: true, approach: 'Creative workaround' },
        ]
      });
      if (response.success) {
        setResult(response.data);
      }
    } catch {
      setResult({
        growthPotentialScore: 78,
        potentialLevel: 'HIGH',
        predictedPerformance6Mo: 86,
        predictedPerformance1Yr: 93,
        learningSpeed: 82,
        learningStyle: 'FAST_ADAPTER',
        showsRapidImprovement: true,
        hintUtilizationScore: 76,
        adaptabilityScore: 75,
        problemSolvingCreativity: 68,
        unfamiliarTopicHandling: 71,
        predictedTrajectory: 'SPECIALIST',
        highPotentialAreas: ['Backend Architecture', 'System Design', 'API Development'],
        developmentAreas: ['Frontend Technologies', 'Cloud Infrastructure', 'Team Leadership'],
        estimatedTimeToSenior: 14,
        percentileRank: 72,
        dimensionScores: { learning: 82, adaptability: 75, creativity: 68, resilience: 79, leadership: 61 },
        executiveSummary: 'Candidate demonstrates strong learning velocity with consistent improvement. Shows particular aptitude for systematic problem-solving.',
        keyStrengths: ['Rapid learning from feedback (82nd percentile)', 'Strong systematic approach', 'Consistent improvement trajectory'],
        investmentRisks: ['Limited large-scale system exposure', 'May need mentorship for cross-functional collaboration'],
        hiringRecommendation: 'HIRE',
        reasoning: 'Above-average growth potential with strong learning speed. Will reach full productivity faster than 68% of similarly-leveled candidates.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-600/20 rounded-xl">
            <Rocket className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Candidate Growth Potential</h1>
            <p className="text-gray-400">AI prediction of future performance & career trajectory</p>
          </div>
        </div>
        <button 
          onClick={runDemoAnalysis}
          disabled={loading}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Brain className="w-4 h-4" /> {loading ? 'Predicting...' : 'Predict Potential'}
        </button>
      </div>

      {!result ? (
        <div className="text-center py-20">
          <Rocket className="w-20 h-20 text-orange-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl text-gray-300 mb-2">No Prediction Yet</h2>
          <p className="text-gray-500">Click "Predict Potential" to analyze candidate growth trajectory</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row — Recommendation & Scores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-xl p-5 border ${potentialColors[result.potentialLevel]}`}>
              <div className="text-sm opacity-80 mb-1">Growth Potential</div>
              <div className="text-3xl font-bold">{result.growthPotentialScore.toFixed(0)}<span className="text-lg opacity-60">/100</span></div>
              <div className="text-sm mt-1 font-medium">{result.potentialLevel}</div>
            </div>
            <div className={`rounded-xl p-5 border ${recommendationColors[result.hiringRecommendation]}`}>
              <div className="text-sm opacity-80 mb-1">Recommendation</div>
              <div className="text-2xl font-bold">{result.hiringRecommendation.replace('_', ' ')}</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Predicted Trajectory</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> {result.predictedTrajectory}
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Percentile Rank</div>
              <div className="text-3xl font-bold text-purple-400">{result.percentileRank.toFixed(0)}<span className="text-lg text-gray-400">th</span></div>
            </div>
          </div>

          {/* Performance Predictions */}
          <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" /> Performance Predictions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">Now</div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-700/50 border-2 border-gray-600">
                  <span className="text-xl font-bold text-white">{result.growthPotentialScore.toFixed(0)}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">6 Months</div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-900/30 border-2 border-blue-500/50">
                  <span className="text-xl font-bold text-blue-400">{result.predictedPerformance6Mo.toFixed(0)}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">1 Year</div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/30 border-2 border-green-500/50">
                  <span className="text-xl font-bold text-green-400">{result.predictedPerformance1Yr.toFixed(0)}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm mb-2">Time to Senior</div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-900/30 border-2 border-purple-500/50">
                  <span className="text-xl font-bold text-purple-400">{result.estimatedTimeToSenior}<span className="text-sm">mo</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Dimension Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-400" /> Growth Dimensions
              </h3>
              {Object.entries(result.dimensionScores).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{key}</span>
                    <span className="text-white font-medium">{value.toFixed(0)}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${value > 75 ? 'bg-green-500' : value > 55 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {/* Learning Profile */}
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Learning Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">Style:</span> <span className="text-white ml-1">{result.learningStyle.replace('_', ' ')}</span></div>
                  <div><span className="text-gray-400">Speed:</span> <span className="text-white ml-1">{result.learningSpeed.toFixed(0)}/100</span></div>
                  <div><span className="text-gray-400">Hint Utilization:</span> <span className="text-white ml-1">{result.hintUtilizationScore.toFixed(0)}/100</span></div>
                  <div><span className="text-gray-400">Rapid Improvement:</span> <span className={result.showsRapidImprovement ? 'text-green-400' : 'text-yellow-400'}>{result.showsRapidImprovement ? 'Yes' : 'No'}</span></div>
                </div>
              </div>

              {/* High Potential Areas */}
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2"><Star className="w-4 h-4" /> High Potential Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {result.highPotentialAreas.map((area, i) => (
                    <span key={i} className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-xs border border-green-700/30">{area}</span>
                  ))}
                </div>
              </div>

              {/* Development Areas */}
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Development Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {result.developmentAreas.map((area, i) => (
                    <span key={i} className="px-3 py-1 bg-yellow-900/30 text-yellow-300 rounded-full text-xs border border-yellow-700/30">{area}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary & Strengths/Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
              <p className="text-gray-300 leading-relaxed mb-4">{result.executiveSummary}</p>
              <h4 className="text-white font-semibold mb-2">Reasoning</h4>
              <p className="text-gray-400 leading-relaxed">{result.reasoning}</p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2"><Award className="w-4 h-4" /> Key Strengths</h4>
                <ul className="space-y-2">{result.keyStrengths.map((s, i) => <li key={i} className="text-gray-300 text-sm flex items-start gap-2"><Zap className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" /> {s}</li>)}</ul>
              </div>
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-5 border border-gray-700/50">
                <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Investment Risks</h4>
                <ul className="space-y-2">{result.investmentRisks.map((r, i) => <li key={i} className="text-gray-300 text-sm flex items-start gap-2"><AlertTriangle className="w-3 h-3 text-red-400 mt-1 flex-shrink-0" /> {r}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatePotentialPage;
