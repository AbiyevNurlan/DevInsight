package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.*;
import az.edu.itbrains.devinsight2.interview.service.FeedbackLoopService;
import az.edu.itbrains.devinsight2.interview.service.HRReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/hr-review")
@RequiredArgsConstructor
@Slf4j
public class HRReviewController {
    
    private final HRReviewService hrReviewService;
    private final FeedbackLoopService feedbackLoopService;
    
    /**
     * Create HR review with AI artifacts
     */
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createReview(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Creating HR review");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> aiArtifacts = (Map<String, Object>) request.get("aiArtifacts");
            
            HRReviewDto review = hrReviewService.createReview(
                ((Number) request.get("candidateId")).longValue(),
                (String) request.get("candidateName"),
                ((Number) request.get("jobId")).longValue(),
                (String) request.get("jobTitle"),
                aiArtifacts,
                (String) request.get("aiRecommendation"),
                ((Number) request.get("aiConfidence")).doubleValue(),
                (String) request.get("aiReasoning")
            );
            
            response.put("success", true);
            response.put("message", "HR review created");
            response.put("review", review);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to create HR review", e);
            response.put("success", false);
            response.put("message", "Failed to create review: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Submit HR decision
     */
    @PostMapping("/submit-decision/{reviewId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> submitDecision(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Submitting HR decision for review: {}", reviewId);
            
            HRReviewDto review = hrReviewService.submitHRDecision(
                reviewId,
                (String) request.get("hrRecommendation"),
                (String) request.get("hrNotes"),
                (String) request.get("hrDecisionReasoning"),
                (Boolean) request.get("agreesWithAI"),
                (String) request.get("disagreementReason"),
                (String) request.get("finalDecision"),
                (String) request.get("decisionMaker")
            );
            
            response.put("success", true);
            response.put("message", "HR decision submitted");
            response.put("review", review);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to submit HR decision", e);
            response.put("success", false);
            response.put("message", "Failed to submit decision: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get review by candidate and job
     */
    @GetMapping("/candidate/{candidateId}/job/{jobId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getReview(
            @PathVariable Long candidateId,
            @PathVariable Long jobId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            HRReviewDto review = hrReviewService.getReview(candidateId, jobId);
            
            response.put("success", true);
            response.put("review", review);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get review", e);
            response.put("success", false);
            response.put("message", "Failed to get review: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get disagreement cases for model improvement
     */
    @GetMapping("/disagreements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDisagreements() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<HRReviewDto> disagreements = hrReviewService.getDisagreementCases();
            
            response.put("success", true);
            response.put("count", disagreements.size());
            response.put("disagreements", disagreements);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get disagreements", e);
            response.put("success", false);
            response.put("message", "Failed to get disagreements: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Submit feedback for continuous improvement
     */
    @PostMapping("/feedback")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> submitFeedback(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Submitting feedback");
            
            FeedbackDto feedback = feedbackLoopService.submitFeedback(
                ((Number) request.get("candidateId")).longValue(),
                (String) request.get("candidateName"),
                (String) request.get("actualOutcome"),
                (String) request.get("aiPrediction"),
                ((Number) request.get("aiConfidence")).doubleValue(),
                (String) request.get("performanceRating"),
                (Integer) request.get("retentionMonths"),
                (Boolean) request.get("stillEmployed")
            );
            
            response.put("success", true);
            response.put("message", "Feedback submitted");
            response.put("feedback", feedback);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to submit feedback", e);
            response.put("success", false);
            response.put("message", "Failed to submit feedback: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get model performance metrics
     */
    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            ModelPerformanceMetricsDto metrics = feedbackLoopService.calculatePerformanceMetrics();
            
            response.put("success", true);
            response.put("metrics", metrics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get performance metrics", e);
            response.put("success", false);
            response.put("message", "Failed to get metrics: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get all pending reviews for HR panel
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getPendingReviews() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<HRReviewDto> pendingReviews = hrReviewService.getPendingReviews();
            
            response.put("success", true);
            response.put("count", pendingReviews.size());
            response.put("reviews", pendingReviews);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get pending reviews", e);
            response.put("success", false);
            response.put("message", "Failed to get pending reviews: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get all reviews (including completed)
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllReviews() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<HRReviewDto> allReviews = hrReviewService.getAllReviews();
            
            response.put("success", true);
            response.put("count", allReviews.size());
            response.put("reviews", allReviews);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get all reviews", e);
            response.put("success", false);
            response.put("message", "Failed to get reviews: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
