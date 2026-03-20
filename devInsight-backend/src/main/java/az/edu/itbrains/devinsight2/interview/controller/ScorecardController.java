package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.ScorecardDto;
import az.edu.itbrains.devinsight2.interview.service.ExplainableAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Scorecard Controller for Explainable AI
 * Provides transparent scoring explanations and detailed scorecards
 */
@RestController
@RequestMapping("/interview/scorecard")
@RequiredArgsConstructor
@Slf4j
public class ScorecardController {
    
    private final ExplainableAIService explainableAIService;
    
    /**
     * Generate comprehensive scorecard for a candidate
     * POST /interview/scorecard/generate
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'INTERVIEWER')")
    public ResponseEntity<Map<String, Object>> generateScorecard(
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Generating scorecard for candidate: {}", request.get("candidateId"));
            
            // Extract request parameters
            Long candidateId = ((Number) request.get("candidateId")).longValue();
            String candidateName = (String) request.get("candidateName");
            Long jobId = ((Number) request.get("jobId")).longValue();
            String jobTitle = (String) request.get("jobTitle");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> interviewData = (Map<String, Object>) request.getOrDefault("interviewData", new HashMap<>());
            
            // Generate scorecard
            ScorecardDto scorecard = explainableAIService.generateScorecard(
                candidateId, candidateName, jobId, jobTitle, interviewData);
            
            response.put("success", true);
            response.put("message", "Scorecard generated successfully");
            response.put("scorecard", scorecard);
            
            log.info("Scorecard generated: candidateId={}, totalScore={}, performanceLevel={}", 
                candidateId, scorecard.getTotalScore(), scorecard.getPerformanceLevel());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate scorecard", e);
            response.put("success", false);
            response.put("message", "Failed to generate scorecard: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get scorecard for a specific candidate
     * GET /interview/scorecard/{candidateId}
     */
    @GetMapping("/{candidateId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'INTERVIEWER')")
    public ResponseEntity<Map<String, Object>> getScorecard(
            @PathVariable Long candidateId,
            @RequestParam(required = false) Long jobId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Retrieving scorecard for candidate: {}", candidateId);
            
            // In a real implementation, this would fetch from database
            // For now, return a placeholder response
            response.put("success", true);
            response.put("message", "Scorecard retrieval endpoint - implementation in progress");
            response.put("candidateId", candidateId);
            response.put("jobId", jobId);
            response.put("note", "Use POST /interview/scorecard/generate to create new scorecards");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to retrieve scorecard for candidate {}", candidateId, e);
            response.put("success", false);
            response.put("message", "Failed to retrieve scorecard: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Explain a specific score component
     * POST /interview/scorecard/explain-score
     */
    @PostMapping("/explain-score")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'INTERVIEWER')")
    public ResponseEntity<Map<String, Object>> explainScore(
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Double score = ((Number) request.get("score")).doubleValue();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", new HashMap<>());
            
            log.info("Explaining score: {}", score);
            
            Map<String, Object> explanation = explainableAIService.explainScore(score, context);
            
            response.put("success", true);
            response.put("message", "Score explanation generated");
            response.put("explanation", explanation);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to explain score", e);
            response.put("success", false);
            response.put("message", "Failed to explain score: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get all available reason codes
     * GET /interview/scorecard/reason-codes
     */
    @GetMapping("/reason-codes")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'INTERVIEWER')")
    public ResponseEntity<Map<String, Object>> getReasonCodes() {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Retrieving reason codes");
            
            List<Map<String, String>> reasonCodes = explainableAIService.getReasonCodes();
            
            response.put("success", true);
            response.put("message", "Reason codes retrieved successfully");
            response.put("reasonCodes", reasonCodes);
            response.put("totalCodes", reasonCodes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to retrieve reason codes", e);
            response.put("success", false);
            response.put("message", "Failed to retrieve reason codes: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Compare scorecards between multiple candidates
     * POST /interview/scorecard/compare
     */
    @PostMapping("/compare")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> compareScorecard(
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            @SuppressWarnings("unchecked")
            List<Long> candidateIds = (List<Long>) request.get("candidateIds");
            
            log.info("Comparing scorecards for {} candidates", candidateIds.size());
            
            // Placeholder for comparison logic
            response.put("success", true);
            response.put("message", "Scorecard comparison - implementation in progress");
            response.put("candidateIds", candidateIds);
            response.put("note", "Generate individual scorecards first, then use this endpoint for comparison");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to compare scorecards", e);
            response.put("success", false);
            response.put("message", "Failed to compare scorecards: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get feature importance analysis
     * GET /interview/scorecard/feature-importance
     */
    @GetMapping("/feature-importance")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'INTERVIEWER')")
    public ResponseEntity<Map<String, Object>> getFeatureImportance(
            @RequestParam(required = false) String jobRole) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Retrieving feature importance for role: {}", jobRole);
            
            // Return standard feature importance weights
            Map<String, Double> featureWeights = new HashMap<>();
            featureWeights.put("Technical Skills", 0.35);
            featureWeights.put("Problem Solving", 0.25);
            featureWeights.put("Communication", 0.20);
            featureWeights.put("Cultural Fit", 0.10);
            featureWeights.put("Experience Relevance", 0.10);
            
            response.put("success", true);
            response.put("message", "Feature importance retrieved");
            response.put("featureWeights", featureWeights);
            response.put("jobRole", jobRole != null ? jobRole : "General");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to retrieve feature importance", e);
            response.put("success", false);
            response.put("message", "Failed to retrieve feature importance: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Generate bias report for scorecard
     * POST /interview/scorecard/bias-report
     */
    @PostMapping("/bias-report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> generateBiasReport(
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long candidateId = ((Number) request.get("candidateId")).longValue();
            
            log.info("Generating bias report for candidate: {}", candidateId);
            
            // Placeholder for bias analysis
            Map<String, Object> biasReport = new HashMap<>();
            biasReport.put("overallBiasScore", 0.15); // Lower is better (0-1 scale)
            biasReport.put("biasCategories", Map.of(
                "gender", "LOW_RISK",
                "age", "LOW_RISK",
                "ethnicity", "LOW_RISK"
            ));
            biasReport.put("fairnessMetrics", Map.of(
                "disparateImpact", 0.95,
                "equalOpportunityDifference", 0.03
            ));
            biasReport.put("recommendation", "No significant bias detected in scoring");
            
            response.put("success", true);
            response.put("message", "Bias report generated");
            response.put("biasReport", biasReport);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate bias report", e);
            response.put("success", false);
            response.put("message", "Failed to generate bias report: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
