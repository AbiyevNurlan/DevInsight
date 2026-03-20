package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.*;
import az.edu.itbrains.devinsight2.interview.service.LearningPathService;
import az.edu.itbrains.devinsight2.interview.service.SkillGapAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/interview/upskilling")
@RequiredArgsConstructor
@Slf4j
public class UpskillingController {
    
    private final SkillGapAnalysisService skillGapAnalysisService;
    private final LearningPathService learningPathService;
    
    /**
     * Analyze skill gaps for target role
     */
    @PostMapping("/analyze-gaps")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> analyzeSkillGaps(
            @RequestBody SkillGapAnalysisRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Analyzing skill gaps for candidate: {}", request.getCandidateId());
            
            SkillGapAnalysisResponseDto analysis = 
                skillGapAnalysisService.analyzeSkillGaps(request);
            
            response.put("success", true);
            response.put("message", "Skill gap analysis completed");
            response.put("analysis", analysis);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to analyze skill gaps", e);
            response.put("success", false);
            response.put("message", "Skill gap analysis failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Generate personalized learning path
     */
    @PostMapping("/learning-path")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> generateLearningPath(
            @RequestBody LearningPathRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Generating learning path for candidate: {}", request.getCandidateId());
            
            LearningPathResponseDto learningPath = 
                learningPathService.generateLearningPath(request);
            
            response.put("success", true);
            response.put("message", "Learning path generated");
            response.put("learningPath", learningPath);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate learning path", e);
            response.put("success", false);
            response.put("message", "Learning path generation failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Get comprehensive upskilling recommendations
     */
    @PostMapping("/recommendations")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'CANDIDATE')")
    public ResponseEntity<Map<String, Object>> getUpskillingRecommendations(
            @RequestBody SkillGapAnalysisRequestDto gapRequest,
            @RequestBody LearningPathRequestDto pathRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Generating comprehensive upskilling recommendations");
            
            // Analyze gaps
            SkillGapAnalysisResponseDto gapAnalysis = 
                skillGapAnalysisService.analyzeSkillGaps(gapRequest);
            
            // Generate learning path
            LearningPathResponseDto learningPath = 
                learningPathService.generateLearningPath(pathRequest);
            
            response.put("success", true);
            response.put("message", "Upskilling recommendations generated");
            response.put("skillGapAnalysis", gapAnalysis);
            response.put("learningPath", learningPath);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate upskilling recommendations", e);
            response.put("success", false);
            response.put("message", "Recommendations generation failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
