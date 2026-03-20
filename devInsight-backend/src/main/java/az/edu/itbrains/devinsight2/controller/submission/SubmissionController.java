package az.edu.itbrains.devinsight2.controller.submission;

import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.submission.SubmissionResultDto;
import az.edu.itbrains.devinsight2.dto.submission.SubmitAnswerDto;
import az.edu.itbrains.devinsight2.service.grading.TextSimilarityService;
import az.edu.itbrains.devinsight2.service.submission.SubmissionService;
import az.edu.itbrains.devinsight2.service.submission.SubmissionStatisticsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
@Slf4j
@Validated
public class SubmissionController {

    private final SubmissionService submissionService;
    private final TextSimilarityService textSimilarityService;

    /**
     * Submit answers for an interview
     * POST /submissions/interviews/{interviewId}
     */
    @PostMapping("/interviews/{interviewId}")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubmissionResultDto>> submitAnswers(
            @PathVariable Long interviewId,
            @Valid @RequestBody List<SubmitAnswerDto> answers
    ) {
        log.info("Received answer submission for interview: {}", interviewId);

        try {
            if (answers == null || answers.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one answer is required"));
            }

            SubmissionResultDto result = submissionService.submitAnswers(interviewId, answers);

            log.info("Interview {} submitted successfully with score: {}", 
                    interviewId, result.getTotalScore());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Answers submitted and graded successfully", result));
        } catch (Exception e) {
            log.error("Error submitting answers for interview {}: {}", interviewId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error processing submission: " + e.getMessage()));
        }
    }

    /**
     * Get submission results by ID
     * GET /submissions/{submissionId}
     */
    @GetMapping("/{submissionId}")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubmissionResultDto>> getSubmissionResults(
            @PathVariable Long submissionId
    ) {
        log.info("Fetching submission results: {}", submissionId);

        try {
            SubmissionResultDto result = submissionService.getSubmissionResults(submissionId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error fetching submission {}: {}", submissionId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching submission: " + e.getMessage()));
        }
    }

    /**
     * Get user's submissions for an interview (candidate accessible)
     * GET /submissions/interviews/{interviewId}/my-submissions
     */
    @GetMapping("/interviews/{interviewId}/my-submissions")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SubmissionResultDto>>> getUserSubmissions(
            @PathVariable Long interviewId
    ) {
        log.info("Fetching user submissions for interview: {}", interviewId);

        try {
            List<SubmissionResultDto> submissions = submissionService.getUserSubmissions(interviewId);
            return ResponseEntity.ok(ApiResponse.success(submissions));
        } catch (Exception e) {
            log.error("Error fetching user submissions: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching submissions: " + e.getMessage()));
        }
    }

    /**
     * Get all submissions for an interview (admin/HR only)
     * GET /submissions/interviews/{interviewId}
     * 
     * NOTE: interviewId must be a numeric value (e.g., 4, not 4:1)
     */
    @GetMapping("/interviews/{interviewId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<SubmissionResultDto>>> getInterviewSubmissions(
            @PathVariable String interviewId
    ) {
        log.info("Fetching all submissions for interview: {}", interviewId);

        try {
            // Parse and clean the interviewId (handle cases like "4:1" -> "4")
            Long parsedInterviewId = parseInterviewId(interviewId);
            
            if (parsedInterviewId == null) {
                log.warn("Invalid interview ID format: {}", interviewId);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid interview ID format. Expected a number, got: " + interviewId));
            }
            
            List<SubmissionResultDto> submissions = submissionService.getInterviewSubmissions(parsedInterviewId);
            log.info("Found {} submissions for interview {}", submissions.size(), parsedInterviewId);
            return ResponseEntity.ok(ApiResponse.success(submissions));
        } catch (NumberFormatException e) {
            log.error("Invalid interview ID format: {}", interviewId);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid interview ID format: " + interviewId));
        } catch (Exception e) {
            log.error("Error fetching interview submissions: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching submissions: " + e.getMessage()));
        }
    }

    /**
     * Get current user's results for a specific interview (candidate accessible)
     * GET /submissions/interviews/{interviewId}/results
     */
    @GetMapping("/interviews/{interviewId}/results")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<ApiResponse<SubmissionResultDto>> getMyInterviewResults(
            @PathVariable String interviewId
    ) {
        log.info("Fetching current user's results for interview: {}", interviewId);

        try {
            Long parsedInterviewId = parseInterviewId(interviewId);
            
            if (parsedInterviewId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid interview ID format: " + interviewId));
            }
            
            SubmissionResultDto result = submissionService.getMyInterviewResults(parsedInterviewId);
            
            if (result == null) {
                return ResponseEntity.ok(ApiResponse.success("No submission found for this interview", null));
            }
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error fetching interview results: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching results: " + e.getMessage()));
        }
    }

    /**
     * Get submission statistics for an interview
     * GET /submissions/interviews/{interviewId}/statistics
     */
    @GetMapping("/interviews/{interviewId}/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<ApiResponse<SubmissionStatisticsDto>> getStatistics(
            @PathVariable String interviewId
    ) {
        log.info("Fetching submission statistics for interview: {}", interviewId);

        try {
            Long parsedInterviewId = parseInterviewId(interviewId);
            
            if (parsedInterviewId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid interview ID format: " + interviewId));
            }
            
            SubmissionStatisticsDto stats = submissionService.getSubmissionStatistics(parsedInterviewId);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error fetching statistics: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching statistics: " + e.getMessage()));
        }
    }
    
    /**
     * Parse interview ID from string, handling malformed input like "4:1"
     */
    private Long parseInterviewId(String interviewId) {
        if (interviewId == null || interviewId.isBlank()) {
            return null;
        }
        
        // Clean the ID - remove any suffix after colon (handles "4:1" -> "4")
        String cleanId = interviewId.split(":")[0].trim();
        
        try {
            return Long.parseLong(cleanId);
        } catch (NumberFormatException e) {
            log.warn("Could not parse interview ID: {} (cleaned: {})", interviewId, cleanId);
            return null;
        }
    }

    /**
     * TEST ENDPOINT: Test similarity algorithm manually
     * GET /submissions/test-similarity?correct=...&user=...
     */
    @GetMapping("/test-similarity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testSimilarity(
            @RequestParam String correct,
            @RequestParam String user
    ) {
        log.info("=== TEST SIMILARITY ENDPOINT ===");
        log.info("Correct Answer: '{}'", correct);
        log.info("User Answer: '{}'", user);

        try {
            double similarityScore = textSimilarityService.calculateSimilarity(user, correct);
            double points = textSimilarityService.calculatePoints(similarityScore, 10);
            String feedback = textSimilarityService.generateFeedback(similarityScore);

            Map<String, Object> result = new HashMap<>();
            result.put("correctAnswer", correct);
            result.put("userAnswer", user);
            result.put("similarityScore", similarityScore);
            result.put("pointsOutOf10", points);
            result.put("feedback", feedback);

            log.info("Test Result: {}% similarity, {} points", similarityScore, points);
            return ResponseEntity.ok(ApiResponse.success("Similarity test completed", result));
        } catch (Exception e) {
            log.error("Error in similarity test: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error testing similarity: " + e.getMessage()));
        }
    }
}