package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.AnswerEvaluationRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.AnswerScoreDto;
import az.edu.itbrains.devinsight2.interview.dto.CandidateShortlistDto;
import az.edu.itbrains.devinsight2.interview.service.AutoScoringService;
import az.edu.itbrains.devinsight2.interview.service.ShortlistingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/scoring")
@RequiredArgsConstructor
@Slf4j
public class ScoringController {
    
    private final AutoScoringService autoScoringService;
    private final ShortlistingService shortlistingService;
    
    /**
     * Evaluate a single answer
     */
    @PostMapping("/evaluate")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> evaluateAnswer(
            @RequestBody AnswerEvaluationRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Evaluating answer");
            
            AnswerScoreDto score = autoScoringService.evaluateAnswer(request);
            
            response.put("success", true);
            response.put("message", "Answer evaluated successfully");
            response.put("score", score);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to evaluate answer", e);
            response.put("success", false);
            response.put("message", "Failed to evaluate answer: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Generate shortlist from candidate scores
     */
    @PostMapping("/shortlist")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> generateShortlist(
            @RequestBody Map<String, Object> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            @SuppressWarnings("unchecked")
            List<CandidateShortlistDto> candidates = 
                (List<CandidateShortlistDto>) request.get("candidates");
            
            Integer topN = (Integer) request.getOrDefault("topN", 10);
            Double minPercentage = ((Number) request.getOrDefault("minimumPercentage", 60.0)).doubleValue();
            
            log.info("Generating shortlist: topN={}, minPercentage={}", topN, minPercentage);
            
            List<CandidateShortlistDto> shortlist = 
                shortlistingService.generateShortlist(candidates, topN, minPercentage);
            
            response.put("success", true);
            response.put("message", "Shortlist generated successfully");
            response.put("shortlist", shortlist);
            response.put("totalCandidates", candidates.size());
            response.put("shortlistedCount", shortlist.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate shortlist", e);
            response.put("success", false);
            response.put("message", "Failed to generate shortlist: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
