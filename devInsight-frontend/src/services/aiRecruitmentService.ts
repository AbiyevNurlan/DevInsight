import api from './api';

// =====================
// QUESTION GENERATION
// =====================
export const generateQuestions = async (jobTitle: string, skills: string[], experienceLevel: string, count: number = 10) => {
  const response = await api.post('/interview/questions/generate', {
    role: jobTitle,
    skills,
    experienceLevel,
    questionCount: count
  });
  return response.data;
};

// =====================
// SCORING & SHORTLISTING
// =====================
export const scoreAnswer = async (question: string, answer: string, expectedAnswer: string, maxScore: number = 10) => {
  const response = await api.post('/interview/scoring/evaluate', {
    question,
    candidateAnswer: answer,
    idealAnswer: expectedAnswer,
    expectedKeywords: expectedAnswer,
    maxScore
  });
  return response.data;
};

export const getShortlist = async (candidates: any[], topN: number = 10, minimumPercentage: number = 60) => {
  const response = await api.post('/interview/scoring/shortlist', {
    candidates,
    topN,
    minimumPercentage
  });
  return response.data;
};

// =====================
// BEHAVIORAL ANALYSIS
// =====================
export const analyzeBehavior = async (candidateAnswer: string, questionType: string, currentDifficulty: number) => {
  const response = await api.post('/interview/behavioral/analyze', {
    candidateAnswer,
    questionType,
    currentDifficulty
  });
  return response.data;
};

export const getAdaptiveQuestion = async (
  currentQuestion: string, 
  candidateAnswer: string, 
  currentDifficulty: number,
  candidatePerformance: number,
  topicArea: string,
  askedQuestions: string[]
) => {
  const response = await api.post('/interview/behavioral/adaptive-question', {
    currentQuestion,
    candidateAnswer,
    currentDifficulty,
    candidatePerformance,
    topicArea,
    askedQuestions
  });
  return response.data;
};

// =====================
// EXPLAINABILITY
// =====================
export const explainDecision = async (candidateId: number, decisionType: string, decisionData: any) => {
  const response = await api.post('/interview/explainability/explain', {
    candidateId,
    decisionType,
    decisionData
  });
  return response.data;
};

export const getAuditTrail = async (candidateId: number) => {
  const response = await api.get(`/interview/explainability/audit-trail/candidate/${candidateId}`);
  return response.data;
};

// =====================
// UPSKILLING
// =====================
export const analyzeSkillGaps = async (candidateId: number, targetRole: string, currentSkills: string[], yearsOfExperience: number) => {
  const response = await api.post('/interview/upskilling/analyze-gaps', {
    candidateId,
    targetRole,
    currentSkills,
    yearsOfExperience
  });
  return response.data;
};

export const generateLearningPath = async (candidateId: number, targetRole: string, skillGaps: any[], learningStyle: string = 'MIXED', availableHoursPerWeek: number = 10) => {
  const response = await api.post('/interview/upskilling/learning-path', {
    candidateId,
    targetRole,
    skillGaps,
    learningStyle,
    availableHoursPerWeek
  });
  return response.data;
};

// =====================
// TALENT MATCHING
// =====================
export const findTalentMatches = async (jobData: any, limit: number = 20) => {
  const response = await api.post('/interview/matching/find-matches', jobData, {
    params: { limit }
  });
  return response.data;
};

export const getSemanticMatch = async (jobDescription: string, candidateProfile: string, candidateCV: string) => {
  const response = await api.post('/interview/matching/semantic-match', {
    jobDescription,
    candidateProfile,
    candidateCV,
    includeSkillWeighting: true
  });
  return response.data;
};

// =====================
// HR REVIEW
// =====================
export const createHRReview = async (reviewData: {
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  aiArtifacts: any;
  aiRecommendation: string;
  aiConfidence: number;
  aiReasoning: string;
}) => {
  const response = await api.post('/interview/hr-review/create', reviewData);
  return response.data;
};

export const submitHRDecision = async (reviewId: number, decision: {
  hrRecommendation: string;
  hrNotes: string;
  hrDecisionReasoning: string;
  agreesWithAI: boolean;
  disagreementReason?: string;
  finalDecision: string;
  decisionMaker: string;
}) => {
  const response = await api.post(`/interview/hr-review/submit-decision/${reviewId}`, decision);
  return response.data;
};

export const getHRReview = async (candidateId: number, jobId: number) => {
  const response = await api.get(`/interview/hr-review/candidate/${candidateId}/job/${jobId}`);
  return response.data;
};

export const getPendingReviews = async () => {
  const response = await api.get('/interview/hr-review/pending');
  return response.data;
};

export const getAllReviews = async () => {
  const response = await api.get('/interview/hr-review/all');
  return response.data;
};

export const getDisagreements = async () => {
  const response = await api.get('/interview/hr-review/disagreements');
  return response.data;
};

// =====================
// FEEDBACK & METRICS
// =====================
export const submitFeedback = async (feedback: {
  candidateId: number;
  candidateName: string;
  actualOutcome: string;
  aiPrediction: string;
  aiConfidence: number;
  performanceRating?: string;
  retentionMonths?: number;
  stillEmployed?: boolean;
}) => {
  const response = await api.post('/interview/hr-review/feedback', feedback);
  return response.data;
};

export const getModelMetrics = async () => {
  const response = await api.get('/interview/hr-review/metrics');
  return response.data;
};

// =====================
// MULTIMODAL INTERVIEW
// =====================
export const transcribeAudio = async (audioUrl: string, language: string = 'en') => {
  const response = await api.post('/interview/multimodal/transcribe', {
    audioUrl,
    language,
    includeTimestamps: true
  });
  return response.data;
};

export const analyzeMultimodal = async (textAnswer: string, audioTranscript: string, videoTranscript: string) => {
  const response = await api.post('/interview/multimodal/analyze-multimodal', {
    textAnswer,
    audioTranscript,
    videoTranscript
  });
  return response.data;
};

// =====================
// VOICE EMOTION ANALYSIS
// =====================
export const analyzeVoiceEmotion = async (data: {
  candidateId?: number;
  interviewId?: number;
  transcript?: string;
  averagePitch?: number;
  pitchVariance?: number;
  speakingRate?: number;
  pauseFrequency?: number;
  averagePauseDuration?: number;
  volumeLevel?: number;
  volumeVariance?: number;
  pitchTimeline?: number[];
  energyTimeline?: number[];
  totalDurationSeconds?: number;
  questionContext?: string;
}) => {
  const response = await api.post('/interview/voice-emotion/analyze', data);
  return response.data;
};

// =====================
// AI BIAS DETECTION
// =====================
export const detectBias = async (data: {
  interviewId?: number;
  questionsAsked?: Array<{
    question: string;
    questionType: string;
    difficultyLevel: number;
    candidateId: string;
  }>;
  candidateScores?: Array<{
    candidateId: string;
    technicalScore: number;
    communicationScore: number;
    overallScore: number;
    decision: string;
    interviewerNotes: string;
  }>;
  positionTitle?: string;
  department?: string;
}) => {
  const response = await api.post('/interview/bias-detection/analyze', data);
  return response.data;
};

// =====================
// CODE ORIGINALITY DETECTION
// =====================
export const analyzeCodeOriginality = async (data: {
  candidateId?: number;
  interviewId?: number;
  code: string;
  language: string;
  questionTitle?: string;
  questionDescription?: string;
  timeTakenSeconds?: number;
  keystrokeCount?: number;
  pasteEventCount?: number;
  hadCompilationErrors?: boolean;
  codeSnapshots?: Array<{ secondMark: number; code: string; linesOfCode: number }>;
}) => {
  const response = await api.post('/interview/code-originality/analyze', data);
  return response.data;
};

// =====================
// CANDIDATE GROWTH POTENTIAL
// =====================
export const analyzeCandidatePotential = async (data: {
  candidateId?: number;
  interviewId?: number;
  performances?: Array<{
    questionType: string;
    difficulty: number;
    score: number;
    timeTakenSeconds: number;
    usedHints: boolean;
    hintCount: number;
    improvedAfterHint: boolean;
    approach: string;
  }>;
  currentRole?: string;
  yearsExperience?: number;
  currentSkills?: string[];
  educationLevel?: string;
  targetPosition?: string;
}) => {
  const response = await api.post('/interview/candidate-potential/analyze', data);
  return response.data;
};

// =====================
// TEAM CHEMISTRY PREDICTION
// =====================
export const predictTeamChemistry = async (data: {
  candidateId?: number;
  interviewId?: number;
  communicationStyle?: string;
  workPreference?: string;
  conflictResolution?: string;
  decisionMaking?: string;
  values?: string[];
  leadershipStyle?: string;
  extroversionLevel?: number;
  teamName?: string;
  teamSize?: number;
  existingMembers?: Array<{
    role: string;
    communicationStyle: string;
    workPreference: string;
    satisfactionLevel: number;
  }>;
  teamCulture?: string;
  projectType?: string;
}) => {
  const response = await api.post('/interview/team-chemistry/predict', data);
  return response.data;
};

// =====================
// CODE EXECUTION
// =====================
export const executeCode = async (payload: {
  language: string;
  sourceCode: string;
  stdin?: string;
  timeoutSeconds?: number;
  memoryLimitMb?: number;
}) => {
  const response = await api.post('/interview/code-execution/execute', payload);
  return response.data;
};

export const runCodeTestCases = async (payload: {
  language: string;
  sourceCode: string;
  testCases?: string[];
  expectedOutputs?: string[];
}) => {
  const response = await api.post('/interview/code-execution/test-cases', payload);
  return response.data;
};

export const getExecutionLanguages = async () => {
  const response = await api.get('/interview/code-execution/languages');
  return response.data;
};

export const analyzeCodeQuality = async (payload: {
  language: string;
  sourceCode: string;
  stdin?: string;
}) => {
  const response = await api.post('/interview/code-execution/quality-analysis', payload);
  return response.data;
};

// =====================
// MOCK INTERVIEW COACH
// =====================
export const startMockInterview = async (payload: {
  candidateId?: number;
  jobTitle: string;
  difficulty?: string;
  domain?: string;
  technologies?: string[];
  interviewType?: string;
  adaptiveDifficulty?: boolean;
}) => {
  const response = await api.post('/interview/mock-interview/start', payload);
  return response.data;
};

export const submitMockAnswer = async (sessionId: string, answer: string) => {
  const response = await api.post(`/interview/mock-interview/${sessionId}/answer`, { answer });
  return response.data;
};

export const getMockNextQuestion = async (sessionId: string) => {
  const response = await api.get(`/interview/mock-interview/${sessionId}/next`);
  return response.data;
};

export const getMockSessionReport = async (sessionId: string) => {
  const response = await api.get(`/interview/mock-interview/${sessionId}/report`);
  return response.data;
};

export const endMockSession = async (sessionId: string) => {
  const response = await api.delete(`/interview/mock-interview/${sessionId}`);
  return response.data;
};

// =====================
// PREDICTIVE HIRING
// =====================
export const predictHiringOutcome = async (payload: any) => {
  const response = await api.post('/interview/predictive-hiring/predict', payload);
  return response.data;
};

export const getPredictiveSalaryBenchmark = async (role: string, level = 'MID', region = 'Baku') => {
  const response = await api.get('/interview/predictive-hiring/salary-benchmark', {
    params: { role, level, region }
  });
  return response.data;
};

export const getHiringFunnel = async (companyId: number) => {
  const response = await api.get(`/interview/predictive-hiring/funnel/${companyId}`);
  return response.data;
};

// =====================
// SMART SCHEDULER
// =====================
export const findInterviewSlots = async (payload: any) => {
  const response = await api.post('/interview/smart-scheduler/find-slots', payload);
  return response.data;
};

export const rescheduleInterview = async (interviewId: number, newDateTime: string) => {
  const response = await api.post('/interview/smart-scheduler/reschedule', null, {
    params: { interviewId, newDateTime }
  });
  return response.data;
};

export const getInterviewerWorkload = async (interviewerId: number) => {
  const response = await api.get(`/interview/smart-scheduler/workload/${interviewerId}`);
  return response.data;
};

// =====================
// BLOCKCHAIN CERTIFICATES
// =====================
export const issueSkillCertificate = async (payload: any) => {
  const response = await api.post('/interview/blockchain-certificates/issue', payload);
  return response.data;
};

export const verifySkillCertificate = async (certificateId: string) => {
  const response = await api.get(`/interview/blockchain-certificates/verify/${certificateId}`);
  return response.data;
};

export const getCandidateCertificates = async (candidateId: number) => {
  const response = await api.get(`/interview/blockchain-certificates/candidate/${candidateId}`);
  return response.data;
};

export const getCertificateChainStatus = async () => {
  const response = await api.get('/interview/blockchain-certificates/chain-status');
  return response.data;
};

export const revokeSkillCertificate = async (certificateId: string) => {
  const response = await api.delete(`/interview/blockchain-certificates/revoke/${certificateId}`);
  return response.data;
};

// =====================
// REAL-TIME TRANSLATION
// =====================
export const translateText = async (payload: any) => {
  const response = await api.post('/interview/translation/translate', payload);
  return response.data;
};

export const translateTextBatch = async (payload: any[]) => {
  const response = await api.post('/interview/translation/batch', payload);
  return response.data;
};

export const detectTextLanguage = async (text: string) => {
  const response = await api.post('/interview/translation/detect', { text });
  return response.data;
};

export const getTranslationLanguages = async () => {
  const response = await api.get('/interview/translation/languages');
  return response.data;
};

// =====================
// INTERVIEW REPORTS
// =====================
export const generateInterviewReport = async (payload: any) => {
  const response = await api.post('/interview/reports/generate', payload);
  return response.data;
};

export const getInterviewExecutiveSummary = async (interviewId: number, candidateId: number) => {
  const response = await api.get(`/interview/reports/executive-summary/${interviewId}/${candidateId}`);
  return response.data;
};

export const compareInterviewCandidates = async (interviewId: number, candidateIds: number[]) => {
  const response = await api.post('/interview/reports/compare', candidateIds, {
    params: { interviewId }
  });
  return response.data;
};

// =====================
// SCORECARD
// =====================
export const generateScorecard = async (payload: any) => {
  const response = await api.post('/interview/scorecard/generate', payload);
  return response.data;
};

export const getScorecard = async (candidateId: number, jobId?: number) => {
  const response = await api.get(`/interview/scorecard/${candidateId}`, {
    params: jobId ? { jobId } : {}
  });
  return response.data;
};

export const explainScore = async (score: number, context: Record<string, unknown> = {}) => {
  const response = await api.post('/interview/scorecard/explain-score', { score, context });
  return response.data;
};

export const getScoreReasonCodes = async () => {
  const response = await api.get('/interview/scorecard/reason-codes');
  return response.data;
};

export const getScoreFeatureImportance = async (jobRole?: string) => {
  const response = await api.get('/interview/scorecard/feature-importance', {
    params: jobRole ? { jobRole } : {}
  });
  return response.data;
};

// =====================
// EXTENDED EXPLAINABILITY / AUDIT
// =====================
export const getAuditTrailByEvent = async (eventType: string) => {
  const response = await api.get(`/interview/explainability/audit-trail/event/${eventType}`);
  return response.data;
};

export const getAuditTrailByTimeRange = async (start: string, end: string) => {
  const response = await api.get('/interview/explainability/audit-trail/time-range', {
    params: { start, end }
  });
  return response.data;
};

// =====================
// MULTIMODAL EXTENSIONS
// =====================
export const analyzeAudio = async (audioUrl: string, transcript: string) => {
  const response = await api.post('/interview/multimodal/analyze-audio', null, {
    params: { audioUrl, transcript }
  });
  return response.data;
};

export const analyzeVideo = async (videoUrl: string, transcript: string) => {
  const response = await api.post('/interview/multimodal/analyze-video', null, {
    params: { videoUrl, transcript }
  });
  return response.data;
};

// =====================
// FEEDBACK WORKFLOW
// =====================
export const createInterviewFeedback = async (interviewId: number, payload: any) => {
  const response = await api.post(`/feedback/interview/${interviewId}`, payload);
  return response.data;
};

export const finalizeInterviewFeedback = async (feedbackId: number) => {
  const response = await api.post(`/feedback/${feedbackId}/finalize`);
  return response.data;
};

export const shareInterviewFeedback = async (feedbackId: number) => {
  const response = await api.post(`/feedback/${feedbackId}/share`);
  return response.data;
};

export default {
  generateQuestions,
  scoreAnswer,
  getShortlist,
  analyzeBehavior,
  getAdaptiveQuestion,
  explainDecision,
  getAuditTrail,
  analyzeSkillGaps,
  generateLearningPath,
  findTalentMatches,
  getSemanticMatch,
  createHRReview,
  submitHRDecision,
  getHRReview,
  getPendingReviews,
  getAllReviews,
  getDisagreements,
  submitFeedback,
  getModelMetrics,
  transcribeAudio,
  analyzeMultimodal,
  analyzeVoiceEmotion,
  detectBias,
  analyzeCodeOriginality,
  analyzeCandidatePotential,
  predictTeamChemistry,
  executeCode,
  runCodeTestCases,
  getExecutionLanguages,
  analyzeCodeQuality,
  startMockInterview,
  submitMockAnswer,
  getMockNextQuestion,
  getMockSessionReport,
  endMockSession,
  predictHiringOutcome,
  getPredictiveSalaryBenchmark,
  getHiringFunnel,
  findInterviewSlots,
  rescheduleInterview,
  getInterviewerWorkload,
  issueSkillCertificate,
  verifySkillCertificate,
  getCandidateCertificates,
  getCertificateChainStatus,
  revokeSkillCertificate,
  translateText,
  translateTextBatch,
  detectTextLanguage,
  getTranslationLanguages,
  generateInterviewReport,
  getInterviewExecutiveSummary,
  compareInterviewCandidates,
  generateScorecard,
  getScorecard,
  explainScore,
  getScoreReasonCodes,
  getScoreFeatureImportance,
  getAuditTrailByEvent,
  getAuditTrailByTimeRange,
  analyzeAudio,
  analyzeVideo,
  createInterviewFeedback,
  finalizeInterviewFeedback,
  shareInterviewFeedback
};
