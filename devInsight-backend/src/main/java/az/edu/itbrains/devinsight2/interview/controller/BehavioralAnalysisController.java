package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.*;
import az.edu.itbrains.devinsight2.interview.service.AdaptiveQuestioningService;
import az.edu.itbrains.devinsight2.interview.service.BehavioralAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/behavioral")
@RequiredArgsConstructor
@Slf4j
public class BehavioralAnalysisController {
    
    private final BehavioralAnalysisService behavioralAnalysisService;
    private final AdaptiveQuestioningService adaptiveQuestioningService;
    
    /**
     * Analyze candidate's behavioral patterns
     */
    @PostMapping("/analyze")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeBehavior(
            @RequestBody BehavioralAnalysisRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Analyzing behavioral patterns");
            
            BehavioralAnalysisResultDto analysis = 
                behavioralAnalysisService.analyzeBehavior(request);
            
            response.put("success", true);
            response.put("message", "Behavioral analysis completed");
            response.put("analysis", analysis);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to analyze behavior", e);
            response.put("success", false);
            response.put("message", "Failed to analyze behavior: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Generate next adaptive question based on performance
     */
    @PostMapping("/adaptive-question")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> generateAdaptiveQuestion(
            @RequestBody AdaptiveQuestionRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Generating adaptive question");
            
            AdaptiveQuestionResponseDto question = 
                adaptiveQuestioningService.generateAdaptiveQuestion(request);
            
            response.put("success", true);
            response.put("message", "Adaptive question generated");
            response.put("question", question);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate adaptive question", e);
            response.put("success", false);
            response.put("message", "Failed to generate question: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
