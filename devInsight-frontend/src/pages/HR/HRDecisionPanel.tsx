import React, { useState, useEffect } from 'react';
import {
  User,
  Brain,
  FileText,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Award,
  BarChart2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
  Lightbulb,
  Activity
} from 'lucide-react';
import {
  createHRReview,
  submitHRDecision,
  getHRReview,
  explainDecision,
  submitFeedback,
  getPendingReviews,
  getAllReviews
} from '../../services/aiRecruitmentService';

interface AIArtifacts {
  cvAnalysis?: {
    overallScore: number;
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    highlights: string[];
  };
  interviewScores?: {
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
    overallScore: number;
  };
  behavioralAnalysis?: {
    confidenceLevel: number;
    stressResponse: string;
    communicationStyle: string;
    adaptability: string;
    engagementLevel: number;
  };
  skillGapAnalysis?: {
    matchingSkills: string[];
    gapSkills: string[];
    transferableSkills: string[];
    upskillPotential: string;
  };
  matchingScore?: number;
}

interface ReviewData {
  reviewId?: number;
  candidateId: number;
  candidateName: string;
  positionApplied: string;
  aiRecommendation: string;
  aiConfidence: number;
  artifacts: AIArtifacts;
  hrDecision?: string;
  decisionNotes?: string;
  agreementStatus?: string;
}

const HRDecisionPanel: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    isCorrect: true,
    comments: '',
    suggestedLabel: ''
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await getAllReviews();
      if (response.success && response.reviews && response.reviews.length > 0) {
        const mapped: ReviewData[] = response.reviews.map((r: any) => ({
          reviewId: r.id,
          candidateId: r.candidateId,
          candidateName: r.candidateName || `Candidate ${r.candidateId}`,
          positionApplied: r.jobTitle || 'Position',
          aiRecommendation: r.aiRecommendation || 'MAYBE',
          aiConfidence: r.aiConfidence || 0.5,
          artifacts: {
            cvAnalysis: r.cvAnalysis || undefined,
            interviewScores: r.interviewScores || undefined,
            behavioralAnalysis: r.behavioralAnalysis || undefined,
            skillGapAnalysis: r.skillGapAnalysis || undefined,
            matchingScore: r.matchingScore?.score || r.matchingScore || undefined,
          },
          hrDecision: r.finalDecision === 'PENDING' ? undefined : r.finalDecision,
          decisionNotes: r.hrNotes,
          agreementStatus: r.agreesWithAI ? 'AGREED' : r.agreesWithAI === false ? 'DISAGREED' : undefined,
        }));
        setReviews(mapped);
      } else {
        loadDemoReviews();
      }
    } catch (error) {
      console.log('API not available, loading demo data');
      loadDemoReviews();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoReviews = () => {
    const demoReviews: ReviewData[] = [
      {
        reviewId: 1,
        candidateId: 101,
        candidateName: 'Elvin Mammadov',
        positionApplied: 'Senior Java Developer',
        aiRecommendation: 'STRONG_YES',
        aiConfidence: 0.92,
        artifacts: {
          cvAnalysis: {
            overallScore: 88,
            skillsMatch: 92,
            experienceMatch: 85,
            educationMatch: 80,
            highlights: ['8+ years Java experience', 'Spring Boot expert', 'Microservices architecture']
          },
          interviewScores: {
            technicalScore: 90,
            communicationScore: 85,
            problemSolvingScore: 88,
            overallScore: 88
          },
          behavioralAnalysis: {
            confidenceLevel: 85,
            stressResponse: 'CALM',
            communicationStyle: 'CLEAR',
            adaptability: 'HIGH',
            engagementLevel: 90
          },
          skillGapAnalysis: {
            matchingSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Kubernetes'],
            gapSkills: ['AWS'],
            transferableSkills: ['Azure'],
            upskillPotential: 'HIGH'
          },
          matchingScore: 89
        }
      },
      {
        reviewId: 2,
        candidateId: 102,
        candidateName: 'Aysel Huseynova',
        positionApplied: 'Frontend Developer',
        aiRecommendation: 'YES',
        aiConfidence: 0.78,
        artifacts: {
          cvAnalysis: {
            overallScore: 75,
            skillsMatch: 80,
            experienceMatch: 70,
            educationMatch: 85,
            highlights: ['React expert', 'TypeScript', '5 years frontend experience']
          },
          interviewScores: {
            technicalScore: 78,
            communicationScore: 90,
            problemSolvingScore: 75,
            overallScore: 80
          },
          behavioralAnalysis: {
            confidenceLevel: 75,
            stressResponse: 'MODERATE',
            communicationStyle: 'FRIENDLY',
            adaptability: 'HIGH',
            engagementLevel: 85
          },
          skillGapAnalysis: {
            matchingSkills: ['React', 'TypeScript', 'CSS', 'Jest'],
            gapSkills: ['Vue.js', 'Angular'],
            transferableSkills: ['Svelte'],
            upskillPotential: 'MEDIUM'
          },
          matchingScore: 77
        }
      },
      {
        reviewId: 3,
        candidateId: 103,
        candidateName: 'Tural Aliyev',
        positionApplied: 'DevOps Engineer',
        aiRecommendation: 'MAYBE',
        aiConfidence: 0.55,
        artifacts: {
          cvAnalysis: {
            overallScore: 60,
            skillsMatch: 55,
            experienceMatch: 65,
            educationMatch: 70,
            highlights: ['Linux admin', 'CI/CD experience', 'Growing in cloud']
          },
          interviewScores: {
            technicalScore: 62,
            communicationScore: 70,
            problemSolvingScore: 65,
            overallScore: 65
          },
          behavioralAnalysis: {
            confidenceLevel: 60,
            stressResponse: 'NERVOUS',
            communicationStyle: 'RESERVED',
            adaptability: 'MODERATE',
            engagementLevel: 70
          },
          skillGapAnalysis: {
            matchingSkills: ['Linux', 'Docker', 'Jenkins'],
            gapSkills: ['Kubernetes', 'Terraform', 'AWS'],
            transferableSkills: ['Ansible'],
            upskillPotential: 'MEDIUM'
          },
          matchingScore: 60
        }
      },
      {
        reviewId: 4,
        candidateId: 104,
        candidateName: 'Leyla Rzayeva',
        positionApplied: 'Data Scientist',
        aiRecommendation: 'NO',
        aiConfidence: 0.85,
        artifacts: {
          cvAnalysis: {
            overallScore: 45,
            skillsMatch: 40,
            experienceMatch: 50,
            educationMatch: 60,
            highlights: ['Python basics', 'Statistics background', 'Eager to learn']
          },
          interviewScores: {
            technicalScore: 45,
            communicationScore: 75,
            problemSolvingScore: 50,
            overallScore: 55
          },
          behavioralAnalysis: {
            confidenceLevel: 55,
            stressResponse: 'ANXIOUS',
            communicationStyle: 'EAGER',
            adaptability: 'HIGH',
            engagementLevel: 80
          },
          skillGapAnalysis: {
            matchingSkills: ['Python', 'Statistics'],
            gapSkills: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'],
            transferableSkills: ['R'],
            upskillPotential: 'HIGH'
          },
          matchingScore: 42
        }
      }
    ];
    setReviews(demoReviews);
  };

  const handleSelectReview = async (review: ReviewData) => {
    setSelectedReview(review);
    setDecisionNotes('');
    setLoading(true);
    
    try {
      const response = await explainDecision(review.candidateId, 'HIRING', review.artifacts);
      if (response.reasons) {
        setExplanations(response.reasons);
      }
    } catch (error) {
      setExplanations([
        'Strong technical skills matching job requirements',
        'Positive behavioral indicators during interview',
        'Good cultural fit based on communication style'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleHRDecision = async (decision: string) => {
    if (!selectedReview) return;
    
    setLoading(true);
    try {
      await submitHRDecision(selectedReview.reviewId!, {
        hrRecommendation: decision,
        hrNotes: decisionNotes,
        hrDecisionReasoning: decisionNotes || 'HR decision made',
        agreesWithAI: decision === selectedReview.aiRecommendation.replace('STRONG_YES', 'YES'),
        finalDecision: decision,
        decisionMaker: 'HR Manager'
      });
      
      // Update local state
      setReviews(reviews.map(r => 
        r.reviewId === selectedReview.reviewId 
          ? { ...r, hrDecision: decision, decisionNotes }
          : r
      ));
      
      setSelectedReview({ ...selectedReview, hrDecision: decision, decisionNotes });
    } catch (error) {
      // Demo update
      setReviews(reviews.map(r => 
        r.reviewId === selectedReview.reviewId 
          ? { ...r, hrDecision: decision, decisionNotes }
          : r
      ));
      setSelectedReview({ ...selectedReview, hrDecision: decision, decisionNotes });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedReview) return;
    
    try {
      await submitFeedback({
        candidateId: selectedReview.candidateId,
        candidateName: selectedReview.candidateName,
        aiPrediction: selectedReview.aiRecommendation,
        actualOutcome: feedbackData.suggestedLabel || selectedReview.hrDecision || 'HIRE',
        aiConfidence: selectedReview.aiConfidence,
        performanceRating: feedbackData.isCorrect ? 'GOOD' : 'POOR'
      });
    } catch (error) {
      console.log('Feedback submitted (demo)');
    }
    setShowFeedbackModal(false);
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'STRONG_YES': return { color: 'bg-green-100 text-green-800', icon: ThumbsUp, label: 'Strong Yes' };
      case 'YES': return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Yes' };
      case 'MAYBE': return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Maybe' };
      case 'NO': return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'No' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle, label: rec };
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'HIRE': return 'bg-green-500 text-white';
      case 'REJECT': return 'bg-red-500 text-white';
      case 'INTERVIEW_AGAIN': return 'bg-yellow-500 text-white';
      case 'WAITLIST': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            HR Decision Panel
          </h1>
          <p className="text-gray-600 mt-2">Review AI recommendations and make final hiring decisions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Pending Reviews</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {reviews.map((review) => {
                  const badge = getRecommendationBadge(review.aiRecommendation);
                  return (
                    <button
                      key={review.reviewId}
                      onClick={() => handleSelectReview(review)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                        selectedReview?.reviewId === review.reviewId ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{review.candidateName}</p>
                          <p className="text-sm text-gray-500">{review.positionApplied}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      {review.hrDecision && (
                        <div className="mt-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getDecisionBadge(review.hrDecision)}`}>
                            {review.hrDecision.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review Details */}
          <div className="lg:col-span-2">
            {selectedReview ? (
              <div className="space-y-6">
                {/* Candidate Header */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedReview.candidateName}</h2>
                        <p className="text-gray-600">{selectedReview.positionApplied}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {(() => {
                            const badge = getRecommendationBadge(selectedReview.aiRecommendation);
                            const Icon = badge.icon;
                            return (
                              <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${badge.color}`}>
                                <Icon className="w-4 h-4" />
                                AI: {badge.label}
                              </span>
                            );
                          })()}
                          <span className="text-sm text-gray-500">
                            Confidence: {(selectedReview.aiConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Provide Feedback
                    </button>
                  </div>
                </div>

                {/* AI Analysis Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CV Analysis */}
                  {selectedReview.artifacts.cvAnalysis && (
                    <AnalysisCard
                      title="CV Analysis"
                      icon={FileText}
                      color="blue"
                    >
                      <ScoreBar label="Overall" score={selectedReview.artifacts.cvAnalysis.overallScore} />
                      <ScoreBar label="Skills Match" score={selectedReview.artifacts.cvAnalysis.skillsMatch} />
                      <ScoreBar label="Experience" score={selectedReview.artifacts.cvAnalysis.experienceMatch} />
                      <ScoreBar label="Education" score={selectedReview.artifacts.cvAnalysis.educationMatch} />
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Highlights:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {selectedReview.artifacts.cvAnalysis.highlights.map((h, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AnalysisCard>
                  )}

                  {/* Interview Scores */}
                  {selectedReview.artifacts.interviewScores && (
                    <AnalysisCard
                      title="Interview Scores"
                      icon={Target}
                      color="green"
                    >
                      <ScoreBar label="Technical" score={selectedReview.artifacts.interviewScores.technicalScore} />
                      <ScoreBar label="Communication" score={selectedReview.artifacts.interviewScores.communicationScore} />
                      <ScoreBar label="Problem Solving" score={selectedReview.artifacts.interviewScores.problemSolvingScore} />
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Overall Score</span>
                          <span className="text-2xl font-bold text-green-600">
                            {selectedReview.artifacts.interviewScores.overallScore}%
                          </span>
                        </div>
                      </div>
                    </AnalysisCard>
                  )}

                  {/* Behavioral Analysis */}
                  {selectedReview.artifacts.behavioralAnalysis && (
                    <AnalysisCard
                      title="Behavioral Analysis"
                      icon={Brain}
                      color="purple"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Confidence Level</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedReview.artifacts.behavioralAnalysis.confidenceLevel}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stress Response</span>
                          <BehaviorBadge value={selectedReview.artifacts.behavioralAnalysis.stressResponse} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Communication</span>
                          <BehaviorBadge value={selectedReview.artifacts.behavioralAnalysis.communicationStyle} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Adaptability</span>
                          <BehaviorBadge value={selectedReview.artifacts.behavioralAnalysis.adaptability} />
                        </div>
                        <ScoreBar label="Engagement" score={selectedReview.artifacts.behavioralAnalysis.engagementLevel} />
                      </div>
                    </AnalysisCard>
                  )}

                  {/* Skill Gap Analysis */}
                  {selectedReview.artifacts.skillGapAnalysis && (
                    <AnalysisCard
                      title="Skill Gap Analysis"
                      icon={TrendingUp}
                      color="orange"
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Matching Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedReview.artifacts.skillGapAnalysis.matchingSkills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Gap Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedReview.artifacts.skillGapAnalysis.gapSkills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-gray-600">Upskill Potential</span>
                          <BehaviorBadge value={selectedReview.artifacts.skillGapAnalysis.upskillPotential} />
                        </div>
                      </div>
                    </AnalysisCard>
                  )}
                </div>

                {/* AI Explanations */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    AI Reasoning (Explainable AI)
                  </h3>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {explanations.map((exp, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* HR Decision Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Decision</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision Notes</label>
                    <textarea
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleHRDecision('HIRE')}
                      disabled={loading}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Hire
                    </button>
                    <button
                      onClick={() => handleHRDecision('REJECT')}
                      disabled={loading}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleHRDecision('INTERVIEW_AGAIN')}
                      disabled={loading}
                      className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Clock className="w-5 h-5" />
                      Re-Interview
                    </button>
                    <button
                      onClick={() => handleHRDecision('WAITLIST')}
                      disabled={loading}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Award className="w-5 h-5" />
                      Waitlist
                    </button>
                  </div>

                  {selectedReview.hrDecision && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Current Decision: 
                        <span className={`ml-2 px-2 py-1 rounded ${getDecisionBadge(selectedReview.hrDecision)}`}>
                          {selectedReview.hrDecision.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a candidate to review their AI analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provide Feedback on AI Recommendation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Was the AI recommendation accurate?
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFeedbackData({ ...feedbackData, isCorrect: true })}
                      className={`flex-1 py-2 rounded-lg border ${
                        feedbackData.isCorrect 
                          ? 'bg-green-100 border-green-500 text-green-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4 inline mr-2" />
                      Yes
                    </button>
                    <button
                      onClick={() => setFeedbackData({ ...feedbackData, isCorrect: false })}
                      className={`flex-1 py-2 rounded-lg border ${
                        !feedbackData.isCorrect 
                          ? 'bg-red-100 border-red-500 text-red-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4 inline mr-2" />
                      No
                    </button>
                  </div>
                </div>

                {!feedbackData.isCorrect && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What should the recommendation have been?
                    </label>
                    <select
                      value={feedbackData.suggestedLabel}
                      onChange={(e) => setFeedbackData({ ...feedbackData, suggestedLabel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="STRONG_YES">Strong Yes</option>
                      <option value="YES">Yes</option>
                      <option value="MAYBE">Maybe</option>
                      <option value="NO">No</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={feedbackData.comments}
                    onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                    placeholder="What could the AI have done better?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Analysis Card Component
const AnalysisCard: React.FC<{
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, color, children }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </span>
        {title}
      </h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

// Score Bar Component
const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-700 font-medium">{score}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div 
        className={`h-1.5 rounded-full ${
          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

// Behavior Badge Component
const BehaviorBadge: React.FC<{ value: string }> = ({ value }) => {
  const getBadgeColor = (val: string) => {
    const positives = ['CALM', 'CLEAR', 'HIGH', 'FRIENDLY'];
    const neutrals = ['MODERATE', 'MEDIUM', 'RESERVED'];
    if (positives.includes(val)) return 'bg-green-100 text-green-700';
    if (neutrals.includes(val)) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${getBadgeColor(value)}`}>
      {value}
    </span>
  );
};

export default HRDecisionPanel;
