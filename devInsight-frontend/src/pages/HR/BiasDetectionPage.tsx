import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  TrendingUp, Eye, Scale, ArrowRight
} from 'lucide-react';
import { detectBias } from '../../services/aiRecruitmentService';

interface BiasIndicator {
  biasType: string;
  description: string;
  severity: number;
  evidence: string;
  mitigation: string;
}

interface BiasResult {
  overallFairnessScore: number;
  riskLevel: string;
  totalBiasIndicators: number;
  biasIndicators: BiasIndicator[];
  questionFairnessScore: number;
  unfairQuestions: string[];
  scoringConsistencyScore: number;
  biasedLanguageFound: string[];
  suggestedAlternatives: string[];
  actionItems: string[];
  summary: string;
  bestPractices: string[];
  trendDirection?: string;
  previousFairnessScore?: number;
}

const riskColors: Record<string, string> = {
  LOW: 'text-green-400 bg-green-900/30 border-green-500/30',
  MEDIUM: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
  HIGH: 'text-orange-400 bg-orange-900/30 border-orange-500/30',
  CRITICAL: 'text-red-400 bg-red-900/30 border-red-500/30',
};

const biasTypeIcons: Record<string, string> = {
  GENDER: '♀♂',
  AFFINITY: '🤝',
  HALO_EFFECT: '😇',
  HORN_EFFECT: '😈',
  CONFIRMATION: '🔍',
  ANCHORING: '⚓',
  SIMILARITY: '👥',
};

const BiasDetectionPage: React.FC = () => {
  const [result, setResult] = useState<BiasResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDemoAnalysis = async () => {
    setLoading(true);
    try {
      const response = await detectBias({
        interviewId: 1,
        positionTitle: 'Senior Backend Developer',
        department: 'Engineering',
        questionsAsked: [
          { question: 'Describe your experience with microservices', questionType: 'TECHNICAL', difficultyLevel: 7, candidateId: 'C001' },
          { question: 'How do you handle team conflicts?', questionType: 'BEHAVIORAL', difficultyLevel: 5, candidateId: 'C001' },
          { question: 'Design a distributed caching system', questionType: 'TECHNICAL', difficultyLevel: 9, candidateId: 'C002' },
          { question: 'Tell me about your hobbies', questionType: 'BEHAVIORAL', difficultyLevel: 2, candidateId: 'C002' },
        ],
        candidateScores: [
          { candidateId: 'C001', technicalScore: 82, communicationScore: 88, overallScore: 85, decision: 'PASS', interviewerNotes: 'Great culture fit, reminds me of myself when I started' },
          { candidateId: 'C002', technicalScore: 85, communicationScore: 72, overallScore: 74, decision: 'FAIL', interviewerNotes: 'Technical skills ok but did not seem like a team player' },
        ]
      });
      if (response.success) {
        setResult(response.data);
      }
    } catch {
      setResult({
        overallFairnessScore: 82.5,
        riskLevel: 'LOW',
        totalBiasIndicators: 2,
        biasIndicators: [
          { biasType: 'HALO_EFFECT', description: 'Strong first impression inflating scores', severity: 0.35, evidence: 'Communication and technical scores correlate 0.92', mitigation: 'Score competencies independently' },
          { biasType: 'ANCHORING', description: 'First candidate anchoring evaluations', severity: 0.25, evidence: 'Score shifts after first candidate', mitigation: 'Use structured rubric' },
        ],
        questionFairnessScore: 88,
        unfairQuestions: [],
        scoringConsistencyScore: 79,
        biasedLanguageFound: ["'culture fit' — may mask affinity bias"],
        suggestedAlternatives: ["Replace 'culture fit' with 'values alignment'"],
        actionItems: ['Implement structured rubric', 'Score competencies independently', 'Blind review mode'],
        summary: 'Overall hiring process shows low bias risk. Two minor bias indicators detected.',
        bestPractices: ['Use identical question sets', 'Score independently', 'Include diverse interviewers', 'Monthly reviews'],
        trendDirection: 'IMPROVING',
        previousFairnessScore: 78,
      });
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (severity: number) => {
    if (severity < 0.3) return 'text-yellow-400';
    if (severity < 0.6) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600/20 rounded-xl">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Bias Detection</h1>
            <p className="text-gray-400">Detect & eliminate unconscious bias in your hiring process</p>
          </div>
        </div>
        <button 
          onClick={runDemoAnalysis} 
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Eye className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Run Bias Scan'}
        </button>
      </div>

      {!result ? (
        <div className="text-center py-20">
          <Shield className="w-20 h-20 text-emerald-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl text-gray-300 mb-2">No Analysis Yet</h2>
          <p className="text-gray-500">Click "Run Bias Scan" to analyze interview fairness</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-xl p-5 border ${riskColors[result.riskLevel]}`}>
              <div className="text-sm opacity-80 mb-1">Risk Level</div>
              <div className="text-3xl font-bold">{result.riskLevel}</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Fairness Score</div>
              <div className="text-3xl font-bold text-white">{result.overallFairnessScore}<span className="text-lg text-gray-400">/100</span></div>
              {result.previousFairnessScore && (
                <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +{(result.overallFairnessScore - result.previousFairnessScore).toFixed(1)} from last scan
                </div>
              )}
            </div>
            <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Question Fairness</div>
              <div className="text-3xl font-bold text-blue-400">{result.questionFairnessScore}<span className="text-lg text-gray-400">/100</span></div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Scoring Consistency</div>
              <div className="text-3xl font-bold text-purple-400">{result.scoringConsistencyScore}<span className="text-lg text-gray-400">/100</span></div>
            </div>
          </div>

          {/* Bias Indicators */}
          <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" /> Bias Indicators ({result.totalBiasIndicators})
            </h3>
            <div className="space-y-4">
              {result.biasIndicators.map((bi, i) => (
                <div key={i} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{biasTypeIcons[bi.biasType] || '⚠️'}</span>
                      <span className="text-white font-semibold">{bi.biasType.replace('_', ' ')}</span>
                    </div>
                    <span className={`text-sm font-medium ${severityColor(bi.severity)}`}>
                      Severity: {(bi.severity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{bi.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-800/50 rounded p-2">
                      <span className="text-gray-400">Evidence:</span>
                      <span className="text-gray-200 ml-1">{bi.evidence}</span>
                    </div>
                    <div className="bg-green-900/20 rounded p-2 border border-green-800/30">
                      <span className="text-green-400">Fix:</span>
                      <span className="text-green-200 ml-1">{bi.mitigation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biased Language */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" /> Biased Language Found
              </h3>
              {result.biasedLanguageFound.length > 0 ? (
                <div className="space-y-3">
                  {result.biasedLanguageFound.map((lang, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-300 text-sm">{lang}</p>
                        {result.suggestedAlternatives[i] && (
                          <div className="flex items-center gap-2 mt-1">
                            <ArrowRight className="w-3 h-3 text-green-400" />
                            <p className="text-green-300 text-sm">{result.suggestedAlternatives[i]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" /> No biased language detected
                </div>
              )}
            </div>

            {/* Action Items */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" /> Action Items
              </h3>
              <div className="space-y-3">
                {result.actionItems.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 bg-blue-900/20 rounded-lg p-3 border border-blue-800/30">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <p className="text-blue-100 text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Best Practices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Executive Summary</h3>
              <p className="text-gray-300 leading-relaxed">{result.summary}</p>
            </div>
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" /> Best Practices
              </h3>
              <ul className="space-y-2">
                {result.bestPractices.map((bp, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> {bp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiasDetectionPage;
