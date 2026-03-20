import React, { useState } from 'react';
import { 
  Users, Heart, Zap, AlertTriangle, CheckCircle, 
  Target, Lightbulb, ArrowRight, UserPlus, BarChart3
} from 'lucide-react';
import { predictTeamChemistry } from '../../services/aiRecruitmentService';

interface InteractionPrediction {
  memberRole: string;
  compatibilityScore: number;
  interactionType: string;
  advice: string;
}

interface ChemistryResult {
  chemistryScore: number;
  compatibilityLevel: string;
  cultureFitScore: number;
  collaborationPotential: number;
  predictedTeamRole: string;
  roleGapFitScore: number;
  teamGapsTheyFill: string[];
  potentialOverlaps: string[];
  interactions: InteractionPrediction[];
  potentialFrictions: string[];
  synergyOpportunities: string[];
  conflictRisk: number;
  teamProductivityImpact: number;
  personalityDimensions: Record<string, number>;
  summary: string;
  onboardingTips: string[];
  managementAdvice: string;
  teamDynamicsImpact: string;
}

const compatColors: Record<string, string> = {
  EXCELLENT: 'text-purple-400 bg-purple-900/30 border-purple-500/30',
  GOOD: 'text-green-400 bg-green-900/30 border-green-500/30',
  MODERATE: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
  LOW: 'text-orange-400 bg-orange-900/30 border-orange-500/30',
  RISKY: 'text-red-400 bg-red-900/30 border-red-500/30',
};

const interactionColors: Record<string, string> = {
  COMPLEMENTARY: 'bg-green-900/20 border-green-700/30 text-green-300',
  NEUTRAL: 'bg-gray-800/50 border-gray-700/30 text-gray-300',
  POTENTIAL_FRICTION: 'bg-red-900/20 border-red-700/30 text-red-300',
};

const TeamChemistryPage: React.FC = () => {
  const [result, setResult] = useState<ChemistryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDemoAnalysis = async () => {
    setLoading(true);
    try {
      const response = await predictTeamChemistry({
        candidateId: 1,
        interviewId: 1,
        communicationStyle: 'COLLABORATIVE',
        workPreference: 'TEAM',
        conflictResolution: 'COMPROMISE',
        decisionMaking: 'DATA_DRIVEN',
        values: ['innovation', 'quality', 'growth'],
        leadershipStyle: 'DEMOCRATIC',
        extroversionLevel: 0.65,
        teamName: 'Backend Engineering',
        teamSize: 5,
        existingMembers: [
          { role: 'Tech Lead', communicationStyle: 'DIRECT', workPreference: 'FLEXIBLE', satisfactionLevel: 8.5 },
          { role: 'Senior Developer', communicationStyle: 'COLLABORATIVE', workPreference: 'PAIR', satisfactionLevel: 7.8 },
          { role: 'Frontend Developer', communicationStyle: 'EXPRESSIVE', workPreference: 'INDEPENDENT', satisfactionLevel: 7.2 },
          { role: 'QA Engineer', communicationStyle: 'ANALYTICAL', workPreference: 'TEAM', satisfactionLevel: 8.0 },
        ],
        teamCulture: 'AGILE',
        projectType: 'GREENFIELD'
      });
      if (response.success) {
        setResult(response.data);
      }
    } catch {
      setResult({
        chemistryScore: 76,
        compatibilityLevel: 'GOOD',
        cultureFitScore: 79,
        collaborationPotential: 74,
        predictedTeamRole: 'EXECUTOR',
        roleGapFitScore: 82,
        teamGapsTheyFill: ['Backend scalability', 'Code review discipline', 'Documentation culture'],
        potentialOverlaps: ['Backend feature development'],
        interactions: [
          { memberRole: 'Tech Lead', compatibilityScore: 85, interactionType: 'COMPLEMENTARY', advice: 'Natural mentor-mentee dynamic.' },
          { memberRole: 'Senior Developer', compatibilityScore: 78, interactionType: 'COMPLEMENTARY', advice: 'Will collaborate well on complex features.' },
          { memberRole: 'Frontend Developer', compatibilityScore: 65, interactionType: 'POTENTIAL_FRICTION', advice: 'Need clear API contracts.' },
          { memberRole: 'QA Engineer', compatibilityScore: 72, interactionType: 'COMPLEMENTARY', advice: 'Systematic approach helps test discussions.' },
        ],
        potentialFrictions: ['Communication style with frontend team', 'Prefers deeper focus time'],
        synergyOpportunities: ['Complements tech lead vision', 'Documentation elevates team', 'Improves incident response'],
        conflictRisk: 22,
        teamProductivityImpact: 12.5,
        personalityDimensions: { openness: 0.72, conscientiousness: 0.81, extroversion: 0.58, agreeableness: 0.69, neuroticism: 0.31 },
        summary: 'Candidate shows good compatibility (76/100). Predicted EXECUTOR role fills key delivery gap. Expected +12.5% productivity impact.',
        onboardingTips: ['Pair with Tech Lead first week', '1:1 with each member in 2 weeks', 'Start with medium complexity task', 'Include in code review rotation from week 2'],
        managementAdvice: 'Allow dedicated focus time blocks. Their systematic approach thrives with clear task boundaries.',
        teamDynamicsImpact: 'Will strengthen delivery capacity and bring discipline to code review process.'
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
          <div className="p-3 bg-pink-600/20 rounded-xl">
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Team Chemistry Prediction</h1>
            <p className="text-gray-400">AI-driven team compatibility & dynamics forecasting</p>
          </div>
        </div>
        <button 
          onClick={runDemoAnalysis}
          disabled={loading}
          className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Users className="w-4 h-4" /> {loading ? 'Predicting...' : 'Predict Chemistry'}
        </button>
      </div>

      {!result ? (
        <div className="text-center py-20">
          <Users className="w-20 h-20 text-pink-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl text-gray-300 mb-2">No Prediction Yet</h2>
          <p className="text-gray-500">Click "Predict Chemistry" to forecast team compatibility</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className={`rounded-xl p-4 border ${compatColors[result.compatibilityLevel]}`}>
              <div className="text-xs opacity-80 mb-1">Chemistry</div>
              <div className="text-2xl font-bold">{result.chemistryScore}</div>
              <div className="text-xs mt-0.5">{result.compatibilityLevel}</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">Culture Fit</div>
              <div className="text-2xl font-bold text-blue-400">{result.cultureFitScore}</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">Collaboration</div>
              <div className="text-2xl font-bold text-green-400">{result.collaborationPotential}</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">Team Role</div>
              <div className="text-lg font-bold text-white flex items-center gap-1"><Target className="w-4 h-4 text-purple-400" /> {result.predictedTeamRole}</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">Conflict Risk</div>
              <div className={`text-2xl font-bold ${result.conflictRisk > 50 ? 'text-red-400' : 'text-green-400'}`}>{result.conflictRisk}%</div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">Productivity Impact</div>
              <div className={`text-2xl font-bold ${result.teamProductivityImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.teamProductivityImpact > 0 ? '+' : ''}{result.teamProductivityImpact}%
              </div>
            </div>
          </div>

          {/* Team Interaction Map */}
          <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-pink-400" /> Team Interaction Predictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.interactions.map((interaction, i) => (
                <div key={i} className={`rounded-lg p-4 border ${interactionColors[interaction.interactionType]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{interaction.memberRole}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{interaction.compatibilityScore}%</span>
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${
                          interaction.compatibilityScore > 75 ? 'bg-green-500' : 
                          interaction.compatibilityScore > 55 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} style={{ width: `${interaction.compatibilityScore}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs opacity-70 mb-1">{interaction.interactionType.replace('_', ' ')}</div>
                  <p className="text-sm opacity-90">{interaction.advice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personality, Synergies, Frictions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personality Radar (as bars) */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" /> Personality Dimensions
              </h3>
              {Object.entries(result.personalityDimensions).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{key}</span>
                    <span className="text-white font-medium">{(value * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: `${value * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Synergies */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Synergy Opportunities
              </h3>
              <ul className="space-y-3">
                {result.synergyOpportunities.map((s, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> {s}
                  </li>
                ))}
              </ul>
              <h4 className="text-white font-semibold mt-5 mb-2 text-sm">Team Gaps They Fill</h4>
              <div className="flex flex-wrap gap-2">
                {result.teamGapsTheyFill.map((gap, i) => (
                  <span key={i} className="px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs border border-green-700/30">{gap}</span>
                ))}
              </div>
            </div>

            {/* Frictions */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Potential Frictions
              </h3>
              <ul className="space-y-3">
                {result.potentialFrictions.map((f, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <h4 className="text-white font-semibold mt-5 mb-2 text-sm">Potential Overlaps</h4>
              <div className="flex flex-wrap gap-2">
                {result.potentialOverlaps.map((o, i) => (
                  <span key={i} className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs border border-yellow-700/30">{o}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Management Advice & Onboarding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" /> Management Advice
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">{result.managementAdvice}</p>
              <h4 className="text-white font-semibold mb-2">Team Dynamics Impact</h4>
              <p className="text-gray-400 leading-relaxed">{result.teamDynamicsImpact}</p>
            </div>
            <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-400" /> Onboarding Tips
              </h3>
              <div className="space-y-3">
                {result.onboardingTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 bg-blue-900/15 rounded-lg p-3 border border-blue-800/20">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <p className="text-blue-100 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-pink-300 mb-2">Summary</h3>
            <p className="text-pink-100 leading-relaxed">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamChemistryPage;
