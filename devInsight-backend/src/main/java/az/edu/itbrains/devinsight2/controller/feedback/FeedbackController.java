package az.edu.itbrains.devinsight2.controller.feedback;

import az.edu.itbrains.devinsight2.model.interview.InterviewFeedback;
import az.edu.itbrains.devinsight2.model.question.QuestionFeedback;
import az.edu.itbrains.devinsight2.service.feedback.FeedbackService;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Interview feedback management APIs")
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    private final UserService userService;
    
    @PostMapping("/interview/{interviewId}")
    @Operation(summary = "Create feedback for an interview (HR/Admin only)")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<InterviewFeedback> createFeedback(
            @PathVariable Long interviewId,
            @RequestBody FeedbackService.CreateFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.createFeedback(interviewId, request));
    }
    
    @PostMapping("/{feedbackId}/questions")
    @Operation(summary = "Add question-level feedback")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<QuestionFeedback> addQuestionFeedback(
            @PathVariable Long feedbackId,
            @RequestBody QuestionFeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.addQuestionFeedback(
            feedbackId,
            request.getSubmissionId(),
            request.getScore(),
            request.getFeedback(),
            request.getKeyPointsCovered(),
            request.getMissedPoints()
        ));
    }
    
    @PostMapping("/{feedbackId}/finalize")
    @Operation(summary = "Finalize feedback")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<InterviewFeedback> finalizeFeedback(@PathVariable Long feedbackId) {
        return ResponseEntity.ok(feedbackService.finalizeFeedback(feedbackId));
    }
    
    @PostMapping("/{feedbackId}/share")
    @Operation(summary = "Share feedback with candidate")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<InterviewFeedback> shareWithCandidate(@PathVariable Long feedbackId) {
        return ResponseEntity.ok(feedbackService.shareWithCandidate(feedbackId));
    }
    
    @GetMapping("/interview/{interviewId}")
    @Operation(summary = "Get feedback by interview ID")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<InterviewFeedback> getFeedbackByInterview(@PathVariable Long interviewId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByInterview(interviewId));
    }
    
    @GetMapping("/my-feedback")
    @Operation(summary = "Get current candidate's feedback")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Page<InterviewFeedback>> getMyFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long candidateId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(feedbackService.getCandidateFeedback(candidateId, PageRequest.of(page, size)));
    }
    
    @GetMapping("/my-reviews")
    @Operation(summary = "Get feedback created by current HR")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<InterviewFeedback>> getMyReviews() {
        Long reviewerId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(feedbackService.getFeedbackByReviewer(reviewerId));
    }
    
    @GetMapping("/{feedbackId}/questions")
    @Operation(summary = "Get question-level feedback")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<List<QuestionFeedback>> getQuestionFeedback(@PathVariable Long feedbackId) {
        return ResponseEntity.ok(feedbackService.getQuestionFeedback(feedbackId));
    }
    
    @GetMapping("/statistics/company/{companyId}")
    @Operation(summary = "Get feedback statistics for a company")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<FeedbackService.FeedbackStatistics> getCompanyStatistics(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(feedbackService.getCompanyStatistics(companyId));
    }
    
    @Data
    public static class QuestionFeedbackRequest {
        private Long submissionId;
        private Double score;
        private String feedback;
        private String keyPointsCovered;
        private String missedPoints;
    }
}
