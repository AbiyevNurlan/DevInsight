package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.AdaptiveQuestionRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.AdaptiveQuestionResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdaptiveQuestioningService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 1536;
    
    /**
     * Generate next question adaptively based on candidate performance
     */
    public AdaptiveQuestionResponseDto generateAdaptiveQuestion(AdaptiveQuestionRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured");
            return createDefaultQuestion(request);
        }
        
        try {
            log.info("Generating adaptive question. Current difficulty: {}, Performance: {}", 
                request.getCurrentDifficulty(), request.getCandidatePerformance());
            
            String prompt = buildAdaptivePrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseQuestion(responseJson);
            
        } catch (Exception e) {
            log.error("Failed to generate adaptive question: {}", e.getMessage(), e);
            return createDefaultQuestion(request);
        }
    }
    
    /**
     * Build adaptive questioning prompt
     */
    private String buildAdaptivePrompt(AdaptiveQuestionRequestDto request) {
        String performanceLevel = getPerformanceLevel(request.getCandidatePerformance());
        Integer suggestedDifficulty = calculateNewDifficulty(
            request.getCurrentDifficulty(), 
            request.getCandidatePerformance()
        );
        
        return """
            Generate the next interview question adaptively based on candidate performance.
            
            Current Question: %s
            
            Candidate's Answer: %s
            
            Current Difficulty: %d/10
            
            Candidate Performance: %.1f%% (%s)
            
            Topic Area: %s
            
            Previously Asked Questions: %s
            
            Suggested Next Difficulty: %d/10
            
            Return ONLY valid JSON without markdown:
            {
                "nextQuestion": "the follow-up question",
                "adjustedDifficulty": integer 1-10,
                "difficultyChange": "INCREASED|MAINTAINED|DECREASED",
                "reasoning": "why this difficulty level",
                "expectedAnswer": "brief expected answer",
                "evaluationFocus": "what to focus on"
            }
            
            Guidelines:
            - If performance >80%%: Increase difficulty, test deeper knowledge
            - If performance 60-80%%: Maintain level, explore different angles
            - If performance <60%%: Decrease difficulty, build confidence
            - Avoid repeating previous questions
            - Make questions progressively challenging or easier based on performance
            - Keep questions relevant to the topic area
            """.formatted(
                request.getCurrentQuestion(),
                request.getCandidateAnswer(),
                request.getCurrentDifficulty(),
                request.getCandidatePerformance() * 100,
                performanceLevel,
                request.getTopicArea(),
                request.getAskedQuestions(),
                suggestedDifficulty
            );
    }
    
    /**
     * Calculate new difficulty level
     */
    private Integer calculateNewDifficulty(Integer currentDifficulty, Double performance) {
        if (performance >= 0.8) {
            // Performing well - increase difficulty
            return Math.min(10, currentDifficulty + 2);
        } else if (performance >= 0.6) {
            // Adequate - maintain or slight increase
            return Math.min(10, currentDifficulty + 1);
        } else if (performance >= 0.4) {
            // Struggling - maintain or slight decrease
            return Math.max(1, currentDifficulty - 1);
        } else {
            // Poor performance - decrease difficulty
            return Math.max(1, currentDifficulty - 2);
        }
    }
    
    private String getPerformanceLevel(Double performance) {
        if (performance >= 0.8) return "Excellent";
        if (performance >= 0.6) return "Good";
        if (performance >= 0.4) return "Fair";
        return "Needs Improvement";
    }
    
    /**
     * Call Claude API
     */
    private String callClaudeAPI(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", CLAUDE_MODEL);
        requestBody.put("max_tokens", MAX_TOKENS);
        requestBody.put("messages", Collections.singletonList(
            Map.of("role", "user", "content", prompt)
        ));
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            CLAUDE_API_URL,
            HttpMethod.POST,
            request,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return objectMapper.writeValueAsString(response.getBody());
        }
        
        throw new RuntimeException("Claude API call failed");
    }
    
    /**
     * Parse adaptive question from Claude response
     */
    private AdaptiveQuestionResponseDto parseQuestion(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode questionNode = objectMapper.readTree(content);
                
                return AdaptiveQuestionResponseDto.builder()
                    .nextQuestion(questionNode.path("nextQuestion").asText())
                    .adjustedDifficulty(questionNode.path("adjustedDifficulty").asInt(5))
                    .difficultyChange(questionNode.path("difficultyChange").asText("MAINTAINED"))
                    .reasoning(questionNode.path("reasoning").asText(""))
                    .expectedAnswer(questionNode.path("expectedAnswer").asText(""))
                    .evaluationFocus(questionNode.path("evaluationFocus").asText(""))
                    .build();
            }
            
            return createDefaultQuestion(null);
        } catch (Exception e) {
            log.error("Failed to parse adaptive question: {}", e.getMessage(), e);
            return createDefaultQuestion(null);
        }
    }
    
    /**
     * Create default question as fallback
     */
    private AdaptiveQuestionResponseDto createDefaultQuestion(AdaptiveQuestionRequestDto request) {
        Integer difficulty = request != null ? request.getCurrentDifficulty() : 5;
        
        return AdaptiveQuestionResponseDto.builder()
            .nextQuestion("Can you elaborate more on your previous answer?")
            .adjustedDifficulty(difficulty)
            .difficultyChange("MAINTAINED")
            .reasoning("Follow-up question to gather more details")
            .expectedAnswer("Detailed explanation with examples")
            .evaluationFocus("Depth of knowledge and communication clarity")
            .build();
    }
}
