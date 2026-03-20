package az.edu.itbrains.devinsight2.service.feedback;

import az.edu.itbrains.devinsight2.model.core.FeedbackRecommendation;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewFeedback;
import az.edu.itbrains.devinsight2.model.question.QuestionFeedback;
import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.repository.interview.InterviewFeedbackRepository;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.question.QuestionFeedbackRepository;
import az.edu.itbrains.devinsight2.repository.submission.SubmissionRepository;
import az.edu.itbrains.devinsight2.service.audit.AuditLogService;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing interview feedback
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class FeedbackService {
    
    private final InterviewFeedbackRepository feedbackRepository;
    private final QuestionFeedbackRepository questionFeedbackRepository;
    private final InterviewRepository interviewRepository;
    private final SubmissionRepository submissionRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    
    /**
     * Create interview feedback (HR only)
     */
    public InterviewFeedback createFeedback(Long interviewId, CreateFeedbackRequest request) {
        User currentUser = userService.getCurrentUser();
        
        // Verify HR role
        if (currentUser.getRole() != UserRole.HR && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only HR or Admin can create feedback");
        }
        
        Interview interview = interviewRepository.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));
        
        // Check if feedback already exists
        if (feedbackRepository.findByInterviewId(interviewId).isPresent()) {
            throw new RuntimeException("Feedback already exists for this interview");
        }
        
        InterviewFeedback feedback = InterviewFeedback.builder()
            .interview(interview)
            .candidate(interview.getCreatedBy())  // The candidate who took the interview
            .reviewer(currentUser)
            .overallRating(BigDecimal.valueOf(request.getOverallRating()))
            .technicalSkillsRating(request.getTechnicalSkillsRating() != null 
                ? BigDecimal.valueOf(request.getTechnicalSkillsRating()) : null)
            .communicationRating(request.getCommunicationRating() != null 
                ? BigDecimal.valueOf(request.getCommunicationRating()) : null)
            .problemSolvingRating(request.getProblemSolvingRating() != null 
                ? BigDecimal.valueOf(request.getProblemSolvingRating()) : null)
            .cultureFitRating(request.getCultureFitRating() != null 
                ? BigDecimal.valueOf(request.getCultureFitRating()) : null)
            .strengths(request.getStrengths())
            .areasForImprovement(request.getAreasForImprovement())
            .detailedComments(request.getDetailedComments())
            .recommendation(request.getRecommendation())
            .visibleToCandidate(false)
            .isFinalized(false)
            .build();
        
        InterviewFeedback saved = feedbackRepository.save(feedback);
        
        auditLogService.logCreate("INTERVIEW_FEEDBACK", saved.getId(), saved);
        
        log.info("Feedback created for interview {} by {}", interviewId, currentUser.getEmail());
        
        return saved;
    }
    
    /**
     * Add question-level feedback
     */
    public QuestionFeedback addQuestionFeedback(Long feedbackId, Long submissionId, 
                                                 Double score, String feedbackText,
                                                 String keyPointsCovered, String missedPoints) {
        InterviewFeedback interviewFeedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        
        Submission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));
        
        QuestionFeedback questionFeedback = QuestionFeedback.builder()
            .interviewFeedback(interviewFeedback)
            .submission(submission)
            .score(BigDecimal.valueOf(score))
            .feedback(feedbackText)
            .keyPointsCovered(keyPointsCovered)
            .missedPoints(missedPoints)
            .build();
        
        return questionFeedbackRepository.save(questionFeedback);
    }
    
    /**
     * Finalize feedback
     */
    public InterviewFeedback finalizeFeedback(Long feedbackId) {
        InterviewFeedback feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        
        feedback.setIsFinalized(true);
        
        return feedbackRepository.save(feedback);
    }
    
    /**
     * Share feedback with candidate
     */
    public InterviewFeedback shareWithCandidate(Long feedbackId) {
        InterviewFeedback feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        
        if (!feedback.getIsFinalized()) {
            throw new RuntimeException("Feedback must be finalized before sharing");
        }
        
        feedback.setVisibleToCandidate(true);
        feedback.setSharedWithCandidateAt(LocalDateTime.now());
        
        log.info("Feedback {} shared with candidate {}", feedbackId, feedback.getCandidate().getEmail());
        
        return feedbackRepository.save(feedback);
    }
    
    /**
     * Get feedback by interview ID
     */
    @Transactional(readOnly = true)
    public InterviewFeedback getFeedbackByInterview(Long interviewId) {
        return feedbackRepository.findByInterviewId(interviewId)
            .orElseThrow(() -> new RuntimeException("Feedback not found for interview: " + interviewId));
    }
    
    /**
     * Get feedback for candidate (only visible ones)
     */
    @Transactional(readOnly = true)
    public Page<InterviewFeedback> getCandidateFeedback(Long candidateId, Pageable pageable) {
        return feedbackRepository.findByCandidateIdAndVisibleToCandidateTrue(candidateId, pageable);
    }
    
    /**
     * Get all feedback by reviewer (HR)
     */
    @Transactional(readOnly = true)
    public List<InterviewFeedback> getFeedbackByReviewer(Long reviewerId) {
        return feedbackRepository.findByReviewerId(reviewerId);
    }
    
    /**
     * Get feedback statistics for company
     */
    @Transactional(readOnly = true)
    public FeedbackStatistics getCompanyStatistics(Long companyId) {
        long totalFeedback = feedbackRepository.count();
        long hireRecommendations = feedbackRepository.countByRecommendationsAndCompany(
            List.of(FeedbackRecommendation.STRONG_HIRE, FeedbackRecommendation.HIRE, FeedbackRecommendation.LEAN_HIRE),
            companyId
        );
        long noHireRecommendations = feedbackRepository.countByRecommendationsAndCompany(
            List.of(FeedbackRecommendation.STRONG_NO_HIRE, FeedbackRecommendation.NO_HIRE, FeedbackRecommendation.LEAN_NO_HIRE),
            companyId
        );
        
        return FeedbackStatistics.builder()
            .totalFeedback(totalFeedback)
            .hireRecommendations(hireRecommendations)
            .noHireRecommendations(noHireRecommendations)
            .build();
    }
    
    /**
     * Get question feedback for an interview feedback
     */
    @Transactional(readOnly = true)
    public List<QuestionFeedback> getQuestionFeedback(Long feedbackId) {
        return questionFeedbackRepository.findByInterviewFeedbackId(feedbackId);
    }
    
    // DTO classes
    @lombok.Data
    public static class CreateFeedbackRequest {
        private Double overallRating;
        private Double technicalSkillsRating;
        private Double communicationRating;
        private Double problemSolvingRating;
        private Double cultureFitRating;
        private String strengths;
        private String areasForImprovement;
        private String detailedComments;
        private FeedbackRecommendation recommendation;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class FeedbackStatistics {
        private Long totalFeedback;
        private Long hireRecommendations;
        private Long noHireRecommendations;
    }
}
