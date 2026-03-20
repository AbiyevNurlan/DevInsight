package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.interview.dto.GeneratedQuestionDto;
import az.edu.itbrains.devinsight2.interview.dto.QuestionGenerationRequestDto;
import az.edu.itbrains.devinsight2.interview.service.QuestionGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/interview/questions")
@RequiredArgsConstructor
@Slf4j
public class QuestionGenerationController {
    
    private final QuestionGenerationService questionGenerationService;
    
    /**
     * Generate interview questions based on candidate profile
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> generateQuestions(
            @RequestBody QuestionGenerationRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Generating questions for role: {}", request.getRole());
            
            // Set defaults if not provided
            if (request.getQuestionCount() == null) {
                request.setQuestionCount(10);
            }
            if (request.getDifficulty() == null) {
                request.setDifficulty("MEDIUM");
            }
            
            List<GeneratedQuestionDto> questions = questionGenerationService.generateQuestions(request);
            
            response.put("success", true);
            response.put("message", "Questions generated successfully");
            response.put("questions", questions);
            response.put("totalQuestions", questions.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to generate questions", e);
            response.put("success", false);
            response.put("message", "Failed to generate questions: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
