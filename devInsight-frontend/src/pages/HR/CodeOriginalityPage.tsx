import React, { useState } from 'react';
import { 
  Code, Fingerprint, AlertTriangle, CheckCircle, 
  Eye, Shield, FileCode, Clock
} from 'lucide-react';
import { analyzeCodeOriginality } from '../../services/aiRecruitmentService';

interface SimilarSolution {
  source: string;
  similarityScore: number;
  matchType: string;
}

interface OriginalityResult {
  originalityScore: number;
  verdict: string;
  plagiarismRisk: number;
  writingPattern: string;
  typingConsistency: number;
  hasNaturalProgressions: boolean;
  suspiciousPasteEvents: number;
  codeStyleAssessment: string;
  styleIndicators: string[];
  variableNamingOriginality: number;
  usesUncommonApproach: boolean;
  hadDebuggingPhase: boolean;
  showedIterativeThinking: boolean;
  refactorCount: number;
  solutionComplexityMatch: number;
  similarSolutions: SimilarSolution[];
  detailedAnalysis: string;
  redFlags: string[];
  authenticitySignals: string[];
  confidenceBreakdown: Record<string, number>;
}

const verdictConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  ORIGINAL: { color: 'text-green-400', bg: 'bg-green-900/30 border-green-500/30', icon: <CheckCircle className="w-6 h-6" /> },
  SUSPICIOUS: { color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-500/30', icon: <Eye className="w-6 h-6" /> },
  LIKELY_MEMORIZED: { color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-500/30', icon: <AlertTriangle className="w-6 h-6" /> },
  AI_GENERATED: { color: 'text-red-400', bg: 'bg-red-900/30 border-red-500/30', icon: <Shield className="w-6 h-6" /> },
};

const CodeOriginalityPage: React.FC = () => {
  const [result, setResult] = useState<OriginalityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDemoAnalysis = async () => {
    setLoading(true);
    try {
      const response = await analyzeCodeOriginality({
        candidateId: 1,
        interviewId: 1,
        code: `function findLongestSubstring(s) {
  const charMap = new Map();
  let maxLength = 0;
  let windowStart = 0;
  
  for (let windowEnd = 0; windowEnd < s.length; windowEnd++) {
    const currentChar = s[windowEnd];
    if (charMap.has(currentChar)) {
      windowStart = Math.max(windowStart, charMap.get(currentChar) + 1);
    }
    charMap.set(currentChar, windowEnd);
    maxLength = Math.max(maxLength, windowEnd - windowStart + 1);
  }
  return maxLength;
}`,
        language: 'JAVASCRIPT',
        questionTitle: 'Longest Substring Without Repeating Characters',
        timeTakenSeconds: 420,
        keystrokeCount: 680,
        pasteEventCount: 0,
        hadCompilationErrors: true,
        codeSnapshots: [
          { secondMark: 30, code: 'function find', linesOfCode: 2 },
          { secondMark: 120, code: 'function find...charMap', linesOfCode: 5 },
          { secondMark: 240, code: 'function find...for loop basic', linesOfCode: 9 },
          { secondMark: 360, code: 'function find...complete', linesOfCode: 13 },
        ]
      });
      if (response.success) {
        setResult(response.data);
      }
    } catch {
      setResult({
        originalityScore: 78,
        verdict: 'ORIGINAL',
        plagiarismRisk: 22,
        writingPattern: 'ITERATIVE',
        typingConsistency: 79,
        hasNaturalProgressions: true,
        suspiciousPasteEvents: 0,
        codeStyleAssessment: 'UNIQUE',
        styleIndicators: ['Descriptive variable names', 'Consistent indentation', 'Personal comment patterns'],
        variableNamingOriginality: 76,
        usesUncommonApproach: false,
        hadDebuggingPhase: true,
        showedIterativeThinking: true,
        refactorCount: 2,
        solutionComplexityMatch: 84,
        similarSolutions: [{ source: 'Common Sliding Window Pattern', similarityScore: 0.35, matchType: 'ALGORITHM' }],
        detailedAnalysis: 'Code shows genuine problem-solving patterns. Solution built incrementally with natural debugging cycles.',
        redFlags: [],
        authenticitySignals: ['Incremental construction', 'Natural debugging cycles', 'Personal naming conventions', 'Appropriate timing'],
        confidenceBreakdown: { writing_pattern: 82, naming_style: 78, approach: 85, timing: 72 }
      });
    } finally {
      setLoading(false);
    }
  };

  const vConfig = result ? (verdictConfig[result.verdict] || verdictConfig.ORIGINAL) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-600/20 rounded-xl">
            <Fingerprint className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Code Originality Detection</h1>
            <p className="text-gray-400">AI-powered plagiarism & memorization detection for code submissions</p>
          </div>
        </div>
        <button 
          onClick={runDemoAnalysis} 
          disabled={loading}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Code className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>

      {!result ? (
        <div className="text-center py-20">
          <Fingerprint className="w-20 h-20 text-cyan-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl text-gray-300 mb-2">No Analysis Yet</h2>
          <p className="text-gray-500">Click "Analyze Code" to check code originality</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className={`rounded-xl p-6 border ${vConfig?.bg} flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className={vConfig?.color}>{vConfig?.icon}</div>
              <div>
                <div className={`text-2xl font-bold ${vConfig?.color}`}>{result.verdict.replace('_', ' ')}</div>
                <p className="text-gray-300 text-sm">Originality Score: {result.originalityScore.toFixed(1)}/100</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Plagiarism Risk</div>
              <div className={`text-2xl font-bold ${result.plagiarismRisk > 50 ? 'text-red-400' : 'text-green-400'}`}>
                {result.plagiarismRisk.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Writing Pattern', value: result.writingPattern, isText: true },
              { label: 'Typing Consistency', value: result.typingConsistency },
              { label: 'Naming Originality', value: result.variableNamingOriginality },
              { label: 'Complexity Match', value: result.solutionComplexityMatch },
              { label: 'Refactor Cycles', value: result.refactorCount, isCount: true },
              { label: 'Code Style', value: result.codeStyleAssessment, isText: true },
            ].map((m, i) => (
              <div key={i} className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                {m.isText ? (
                  <div className="text-white font-semibold text-lg">{m.value as string}</div>
                ) : m.isCount ? (
                  <div className="text-white font-bold text-2xl">{m.value as number}</div>
                ) : (
                  <div className="text-white font-bold text-2xl">{(m.value as number).toFixed(0)}</div>
                )}
              </div>
            ))}
          </div>

          {/* Writing Behavior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" /> Writing Behavior Signals
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Natural Progressions', value: result.hasNaturalProgressions, good: true },
                  { label: 'Debugging Phase', value: result.hadDebuggingPhase, good: true },
                  { label: 'Iterative Thinking', value: result.showedIterativeThinking, good: true },
                  { label: 'Uncommon Approach', value: result.usesUncommonApproach, good: true },
                ].map((signal, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700/30">
                    <span className="text-gray-300">{signal.label}</span>
                    {signal.value ? (
                      <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Yes</span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" /> No</span>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300">Suspicious Paste Events</span>
                  <span className={result.suspiciousPasteEvents > 2 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                    {result.suspiciousPasteEvents}
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Breakdown */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" /> Confidence Breakdown
              </h3>
              {Object.entries(result.confidenceBreakdown).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-white font-medium">{value.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${value > 70 ? 'bg-green-500' : value > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags & Authenticity Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Red Flags
              </h3>
              {result.redFlags.length === 0 ? (
                <div className="text-green-400 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> No red flags detected</div>
              ) : (
                <ul className="space-y-2">{result.redFlags.map((f, i) => <li key={i} className="text-red-300 text-sm flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {f}</li>)}</ul>
              )}
            </div>
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Authenticity Signals
              </h3>
              <ul className="space-y-2">{result.authenticitySignals.map((s, i) => <li key={i} className="text-green-300 text-sm flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {s}</li>)}</ul>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-3">Detailed Analysis</h3>
            <p className="text-gray-300 leading-relaxed">{result.detailedAnalysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeOriginalityPage;
