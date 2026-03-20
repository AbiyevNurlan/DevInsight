package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.ExplainabilityRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.ExplainabilityResponseDto;
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

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExplainabilityService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Generate explainability report for AI decision
     */
    public ExplainabilityResponseDto explainDecision(ExplainabilityRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured");
            return createDefaultExplanation(request.getDecisionType());
        }
        
        try {
            log.info("Generating explainability report for: {}", request.getDecisionType());
            
            String prompt = buildExplainabilityPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseExplanation(responseJson, request.getDecisionType());
            
        } catch (Exception e) {
            log.error("Failed to generate explanation: {}", e.getMessage(), e);
            return createDefaultExplanation(request.getDecisionType());
        }
    }
    
    /**
     * Build explainability prompt
     */
    private String buildExplainabilityPrompt(ExplainabilityRequestDto request) {
        return """
            Provide a detailed, transparent explanation for the following AI decision.
            
            Decision Type: %s
            
            Decision Data: %s
            
            Return ONLY valid JSON without markdown:
            {
                "overallExplanation": "clear human-readable explanation",
                "featureContributions": {
                    "feature1": percentage (0-100),
                    "feature2": percentage,
                    ...
                },
                "topPositiveFactors": ["factor1", "factor2", "factor3"],
                "topNegativeFactors": ["factor1", "factor2", "factor3"],
                "reasonCodes": [
                    {
                        "code": "CODE_NAME",
                        "category": "TECHNICAL|BEHAVIORAL|EXPERIENCE|EDUCATION",
                        "impact": -100 to +100,
                        "description": "what this means"
                    }
                ],
                "scoreBreakdowns": {
                    "component1": {
                        "score": 0-100,
                        "weight": 0-1,
                        "justification": "why this score",
                        "evidence": ["example1", "example2"]
                    }
                },
                "confidenceLevel": 0.0-1.0,
                "confidenceExplanation": "why this confidence",
                "improvementSuggestions": ["suggestion1", "suggestion2"]
            }
            
            Requirements:
            - Be transparent about how the decision was made
            - Identify key factors that influenced the outcome
            - Provide actionable improvement suggestions
            - Quantify contributions of different features
            - Use clear, non-technical language
            - Assign reason codes for major factors
            - Show evidence from actual data
            """.formatted(
                request.getDecisionType(),
                request.getDecisionData()
            );
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
     * Parse explanation from Claude response
     */
    private ExplainabilityResponseDto parseExplanation(String jsonResponse, String decisionType) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode explainNode = objectMapper.readTree(content);
                
                return ExplainabilityResponseDto.builder()
                    .decisionType(decisionType)
                    .overallExplanation(explainNode.path("overallExplanation").asText())
                    .featureContributions(parseFeatureContributions(explainNode))
                    .topPositiveFactors(parseList(explainNode, "topPositiveFactors"))
                    .topNegativeFactors(parseList(explainNode, "topNegativeFactors"))
                    .reasonCodes(parseReasonCodes(explainNode))
                    .scoreBreakdowns(parseScoreBreakdowns(explainNode))
                    .confidenceLevel(explainNode.path("confidenceLevel").asDouble(0.7))
                    .confidenceExplanation(explainNode.path("confidenceExplanation").asText())
                    .improvementSuggestions(parseList(explainNode, "improvementSuggestions"))
                    .build();
            }
            
            return createDefaultExplanation(decisionType);
        } catch (Exception e) {
            log.error("Failed to parse explanation: {}", e.getMessage(), e);
            return createDefaultExplanation(decisionType);
        }
    }
    
    private Map<String, Double> parseFeatureContributions(JsonNode node) {
        Map<String, Double> contributions = new HashMap<>();
        JsonNode featuresNode = node.path("featureContributions");
        
        if (featuresNode.isObject()) {
            featuresNode.fields().forEachRemaining(entry -> 
                contributions.put(entry.getKey(), entry.getValue().asDouble(0.0))
            );
        }
        
        return contributions;
    }
    
    private List<String> parseList(JsonNode node, String fieldName) {
        List<String> list = new ArrayList<>();
        JsonNode arrayNode = node.path(fieldName);
        
        if (arrayNode.isArray()) {
            arrayNode.forEach(item -> list.add(item.asText()));
        }
        
        return list;
    }
    
    private List<ExplainabilityResponseDto.ReasonCode> parseReasonCodes(JsonNode node) {
        List<ExplainabilityResponseDto.ReasonCode> codes = new ArrayList<>();
        JsonNode codesNode = node.path("reasonCodes");
        
        if (codesNode.isArray()) {
            codesNode.forEach(codeNode -> {
                codes.add(ExplainabilityResponseDto.ReasonCode.builder()
                    .code(codeNode.path("code").asText())
                    .category(codeNode.path("category").asText())
                    .impact(codeNode.path("impact").asInt(0))
                    .description(codeNode.path("description").asText())
                    .build());
            });
        }
        
        return codes;
    }
    
    private Map<String, ExplainabilityResponseDto.ScoreBreakdown> parseScoreBreakdowns(JsonNode node) {
        Map<String, ExplainabilityResponseDto.ScoreBreakdown> breakdowns = new HashMap<>();
        JsonNode breakdownsNode = node.path("scoreBreakdowns");
        
        if (breakdownsNode.isObject()) {
            breakdownsNode.fields().forEachRemaining(entry -> {
                JsonNode breakdownNode = entry.getValue();
                breakdowns.put(entry.getKey(), 
                    ExplainabilityResponseDto.ScoreBreakdown.builder()
                        .component(entry.getKey())
                        .score(breakdownNode.path("score").asDouble(0.0))
                        .weight(breakdownNode.path("weight").asDouble(0.0))
                        .justification(breakdownNode.path("justification").asText())
                        .evidence(parseList(breakdownNode, "evidence"))
                        .build()
                );
            });
        }
        
        return breakdowns;
    }
    
    /**
     * Create default explanation as fallback
     */
    private ExplainabilityResponseDto createDefaultExplanation(String decisionType) {
        return ExplainabilityResponseDto.builder()
            .decisionType(decisionType)
            .overallExplanation("Automated explanation unavailable. Decision was made based on standard evaluation criteria.")
            .featureContributions(Map.of(
                "technical_skills", 40.0,
                "experience", 30.0,
                "communication", 20.0,
                "cultural_fit", 10.0
            ))
            .topPositiveFactors(List.of("Meets basic requirements"))
            .topNegativeFactors(List.of("Detailed analysis not available"))
            .reasonCodes(List.of(
                ExplainabilityResponseDto.ReasonCode.builder()
                    .code("MANUAL_REVIEW_REQUIRED")
                    .category("TECHNICAL")
                    .impact(0)
                    .description("Automated explainability unavailable")
                    .build()
            ))
            .scoreBreakdowns(new HashMap<>())
            .confidenceLevel(0.5)
            .confidenceExplanation("Default confidence - manual review recommended")
            .improvementSuggestions(List.of("Review decision manually for detailed insights"))
            .build();
    }
}
