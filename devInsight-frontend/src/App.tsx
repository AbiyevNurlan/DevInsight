import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Forbidden from './pages/Forbidden'
import Profile from './pages/Profile'
import InterviewDetail from './pages/InterviewDetail'
import InterviewList from './pages/InterviewList'
import SubmissionForm from './pages/SubmissionForm'
import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import HRRoute from './components/HRRoute'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './components/Toast'

// HR Pages
import HRDashboard from './pages/HR/HRDashboard'
import HRAdminDashboard from './pages/HR/HRAdminDashboard'
import VacanciesPage from './pages/HR/VacanciesPage'
import ReportsPage from './pages/HR/ReportsPage'
import HRSettingsPage from './pages/HR/HRSettingsPage'
import { QuestionBank } from './pages/HR/QuestionBank'
import TemplateBuilder from './pages/HR/TemplateBuilder'
import InterviewManager from './pages/HR/InterviewManager'
import AIModelDashboard from './pages/HR/AIModelDashboard'
import TalentMatchingPage from './pages/HR/TalentMatchingPage'
import HRDecisionPanel from './pages/HR/HRDecisionPanel'
import UpskillingPage from './pages/HR/UpskillingPage'
import VoiceEmotionPage from './pages/HR/VoiceEmotionPage'
import BiasDetectionPage from './pages/HR/BiasDetectionPage'
import CodeOriginalityPage from './pages/HR/CodeOriginalityPage'
import CandidatePotentialPage from './pages/HR/CandidatePotentialPage'
import TeamChemistryPage from './pages/HR/TeamChemistryPage'
import CodeExecutionLabPage from './pages/HR/CodeExecutionLabPage'
import PredictiveHiringPage from './pages/HR/PredictiveHiringPage'
import SmartSchedulerPage from './pages/HR/SmartSchedulerPage'
import CertificatesPage from './pages/HR/CertificatesPage'
import TranslationPage from './pages/HR/TranslationPage'
import InterviewReportsPage from './pages/HR/InterviewReportsPage'
import ScorecardsPage from './pages/HR/ScorecardsPage'
import AuditTrailPage from './pages/HR/AuditTrailPage'
import MultimodalReviewPage from './pages/HR/MultimodalReviewPage'
import FeedbackWorkbenchPage from './pages/HR/FeedbackWorkbenchPage'

// Admin Pages
import AddQuestion from './pages/Admin/AddQuestion'
import QuestionList from './pages/Admin/QuestionList'
import QuestionView from './pages/Admin/QuestionView'
import EditQuestion from './pages/Admin/EditQuestion'
import CompaniesPage from './pages/Admin/CompaniesPage'
import NewAdminDashboard from './pages/NewAdminDashboard'

// Interview Pages
import InterviewComplete from './pages/InterviewComplete'

// Candidate Pages
import { CandidateDashboard } from './pages/Candidate/CandidateDashboard'
import CandidateProfile from './pages/Candidate/CandidateProfile'
import MockInterviewPage from './pages/Candidate/MockInterviewPage'
import PostInterviewChatPage from './pages/Candidate/PostInterviewChatPage'
import GamificationDashboard from './components/Gamification/GamificationDashboard'

// Candidates Management
import CandidatesPage from './pages/Candidates/CandidatesPage'

// Analytics
import AnalyticsPage from './pages/Analytics/AnalyticsPage'

// CV Upload (Isolated Feature)
import CVUploadPage from './features/cv/CVUploadPage'

// Submission Pages
import InterviewSubmissionPage from './pages/InterviewSubmissionPage'
import NewSubmissionResultsPage from './pages/NewSubmissionResultsPage'
import ModernDashboard from './pages/ModernDashboard'

function AppContent() {
  const location = useLocation()
  const role = localStorage.getItem('devinsight_role')

  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.99,
      y: 10, // Reduced distance for faster feel
      filter: 'blur(3px)', // Reduced blur for performance
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4, // Slightly faster (was 0.6)
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 1, // Don't scale up on exit, distracting
      y: -10,
      filter: 'blur(0px)', // Remove blur on exit for performance
      transition: {
        duration: 0.3, // Faster exit
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <Layout>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative w-full"
        >
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forbidden" element={<Forbidden />} />

            {/* Role-based Dashboard Redirect */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <NewAdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin-dashboard" element={
              <AdminRoute>
                <NewAdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/questions" element={
              <AdminRoute>
                <QuestionList />
              </AdminRoute>
            } />
            <Route path="/admin/questions/add" element={
              <AdminRoute>
                <AddQuestion />
              </AdminRoute>
            } />
            <Route path="/admin/questions/:id" element={
              <AdminRoute>
                <QuestionView />
              </AdminRoute>
            } />
            <Route path="/admin/questions/:id/edit" element={
              <AdminRoute>
                <EditQuestion />
              </AdminRoute>
            } />
            <Route path="/admin/companies" element={
              <AdminRoute>
                <CompaniesPage />
              </AdminRoute>
            } />

            {/* HR Routes */}
            <Route path="/hr" element={
              <HRRoute>
                <HRAdminDashboard />
              </HRRoute>
            } />
            <Route path="/hr/admin-dashboard" element={
              <HRRoute>
                <HRAdminDashboard />
              </HRRoute>
            } />
            <Route path="/hr/questions/add" element={
              <HRRoute>
                <AddQuestion />
              </HRRoute>
            } />
            <Route path="/hr/dashboard" element={
              <HRRoute>
                <HRAdminDashboard />
              </HRRoute>
            } />
            <Route path="/hr/questions" element={
              <HRRoute>
                <QuestionList />
              </HRRoute>
            } />
            <Route path="/hr/templates" element={
              <HRRoute>
                <TemplateBuilder />
              </HRRoute>
            } />
            <Route path="/hr/candidates" element={
              <HRRoute>
                <CandidatesPage />
              </HRRoute>
            } />
            <Route path="/hr/vacancies" element={
              <HRRoute>
                <VacanciesPage />
              </HRRoute>
            } />
            <Route path="/hr/reports" element={
              <HRRoute>
                <ReportsPage />
              </HRRoute>
            } />
            <Route path="/hr/settings" element={
              <HRRoute>
                <HRSettingsPage />
              </HRRoute>
            } />
            <Route path="/hr/ai-dashboard" element={
              <HRRoute>
                <AIModelDashboard />
              </HRRoute>
            } />
            <Route path="/hr/talent-matching" element={
              <HRRoute>
                <TalentMatchingPage />
              </HRRoute>
            } />
            <Route path="/hr/decisions" element={
              <HRRoute>
                <HRDecisionPanel />
              </HRRoute>
            } />
            <Route path="/hr/upskilling" element={
              <HRRoute>
                <UpskillingPage />
              </HRRoute>
            } />
            <Route path="/hr/voice-emotion" element={
              <HRRoute>
                <VoiceEmotionPage />
              </HRRoute>
            } />
            <Route path="/hr/bias-detection" element={
              <HRRoute>
                <BiasDetectionPage />
              </HRRoute>
            } />
            <Route path="/hr/code-originality" element={
              <HRRoute>
                <CodeOriginalityPage />
              </HRRoute>
            } />
            <Route path="/hr/candidate-potential" element={
              <HRRoute>
                <CandidatePotentialPage />
              </HRRoute>
            } />
            <Route path="/hr/team-chemistry" element={
              <HRRoute>
                <TeamChemistryPage />
              </HRRoute>
            } />
            <Route path="/hr/code-execution" element={
              <HRRoute>
                <CodeExecutionLabPage />
              </HRRoute>
            } />
            <Route path="/hr/predictive-hiring" element={
              <HRRoute>
                <PredictiveHiringPage />
              </HRRoute>
            } />
            <Route path="/hr/smart-scheduler" element={
              <HRRoute>
                <SmartSchedulerPage />
              </HRRoute>
            } />
            <Route path="/hr/certificates" element={
              <HRRoute>
                <CertificatesPage />
              </HRRoute>
            } />
            <Route path="/hr/translation" element={
              <HRRoute>
                <TranslationPage />
              </HRRoute>
            } />
            <Route path="/hr/interview-reports" element={
              <HRRoute>
                <InterviewReportsPage />
              </HRRoute>
            } />
            <Route path="/hr/scorecards" element={
              <HRRoute>
                <ScorecardsPage />
              </HRRoute>
            } />
            <Route path="/hr/audit-trail" element={
              <HRRoute>
                <AuditTrailPage />
              </HRRoute>
            } />
            <Route path="/hr/multimodal-review" element={
              <HRRoute>
                <MultimodalReviewPage />
              </HRRoute>
            } />
            <Route path="/hr/feedback-workbench" element={
              <HRRoute>
                <FeedbackWorkbenchPage />
              </HRRoute>
            } />

            {/* Admin Candidates Route */}
            <Route path="/admin/candidates" element={
              <AdminRoute>
                <CandidatesPage />
              </AdminRoute>
            } />
            <Route path="/candidates" element={
              <AdminRoute>
                <CandidatesPage />
              </AdminRoute>
            } />

            {/* Analytics Routes */}
            <Route path="/admin/analytics" element={
              <AdminRoute>
                <AnalyticsPage />
              </AdminRoute>
            } />
            <Route path="/hr/analytics" element={
              <HRRoute>
                <AnalyticsPage />
              </HRRoute>
            } />
            <Route path="/analytics" element={
              <AdminRoute>
                <AnalyticsPage />
              </AdminRoute>
            } />

            {/* Candidate Routes — server-verified JWT guard */}
            <Route path="/candidate" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/candidate/dashboard" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/candidate/profile" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <CandidateProfile />
              </ProtectedRoute>
            } />
            <Route path="/candidate/cv-upload" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN', 'HR']}>
                <CVUploadPage />
              </ProtectedRoute>
            } />
            <Route path="/candidate/gamification" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <GamificationDashboard />
              </ProtectedRoute>
            } />
            <Route path="/candidate/mock-interview" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <MockInterviewPage />
              </ProtectedRoute>
            } />
            <Route path="/candidate/post-interview-chat" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <PostInterviewChatPage />
              </ProtectedRoute>
            } />
            <Route path="/gamification" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <GamificationDashboard />
              </ProtectedRoute>
            } />

            {/* Common Routes — require any authenticated user */}
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER', 'CANDIDATE']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/interviews" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER', 'CANDIDATE']}>
                <InterviewList />
              </ProtectedRoute>
            } />
            <Route path="/interviews/:id" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER', 'CANDIDATE']}>
                <InterviewDetail />
              </ProtectedRoute>
            } />
            <Route path="/interviews/:id/manage" element={
              <HRRoute>
                <InterviewManager />
              </HRRoute>
            } />
            <Route path="/interviews/:id/complete" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER', 'CANDIDATE']}>
                <InterviewComplete />
              </ProtectedRoute>
            } />
            <Route path="/interviews/:interviewId/submit" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <SubmissionForm />
              </ProtectedRoute>
            } />

            {/* New Submission Routes */}
            <Route path="/interview/:id/submit" element={
              <ProtectedRoute allowedRoles={['CANDIDATE', 'ADMIN']}>
                <InterviewSubmissionPage />
              </ProtectedRoute>
            } />
            <Route path="/submissions/:id" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER', 'CANDIDATE']}>
                <NewSubmissionResultsPage />
              </ProtectedRoute>
            } />

            {/* Modern Dashboard 2026 */}
            <Route path="/modern-dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'RECRUITER', 'INTERVIEWER', 'CANDIDATE']}>
                <ModernDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
