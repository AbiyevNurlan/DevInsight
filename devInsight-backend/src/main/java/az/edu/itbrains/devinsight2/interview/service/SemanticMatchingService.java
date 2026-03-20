package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.SemanticMatchRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.SemanticMatchResponseDto;
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
public class SemanticMatchingService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Calculate semantic similarity between job and candidate
     */
    public SemanticMatchResponseDto calculateSemanticMatch(SemanticMatchRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured");
            return createDefaultMatch();
        }
        
        try {
            log.info("Calculating semantic match");
            
            String prompt = buildSemanticMatchPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseSemanticMatch(responseJson);
            
        } catch (Exception e) {
            log.error("Failed to calculate semantic match: {}", e.getMessage(), e);
            return createDefaultMatch();
        }
    }
    
    private String buildSemanticMatchPrompt(SemanticMatchRequestDto request) {
        return """
            Analyze semantic similarity between job requirements and candidate profile.
            
            Job Description:
            %s
            
            Candidate Profile:
            %s
            
            Candidate CV:
            %s
            
            Return ONLY valid JSON without markdown:
            {
                "semanticSimilarity": 0-100,
                "matchQuality": "EXCELLENT|GOOD|FAIR|POOR",
                "conceptMatches": {
                    "concept1": similarity_score_0_to_100,
                    "concept2": similarity_score,
                    ...
                },
                "skillRelevance": {
                    "skill1": relevance_weight_0_to_100,
                    "skill2": relevance_weight,
                    ...
                },
                "explanation": "detailed explanation of match quality",
                "recommendation": "hiring recommendation"
            }
            
            Analyze:
            - Deep semantic understanding beyond keyword matching
            - Conceptual alignment between job and candidate
            - Transferable skills and experiences
            - Cultural and domain fit indicators
            - Potential for growth and adaptation
            
            Match Quality Guidelines:
            - EXCELLENT (90-100): Outstanding alignment, rare find
            - GOOD (70-89): Strong fit with minor gaps
            - FAIR (50-69): Potential fit with development needed
            - POOR (<50): Significant misalignment
            """.formatted(
                request.getJobDescription(),
                request.getCandidateProfile(),
                request.getCandidateCV()
            );
    }
    
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
    
    private SemanticMatchResponseDto parseSemanticMatch(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode matchNode = objectMapper.readTree(content);
                
                return SemanticMatchResponseDto.builder()
                    .semanticSimilarity(matchNode.path("semanticSimilarity").asDouble(50.0))
                    .matchQuality(matchNode.path("matchQuality").asText("FAIR"))
                    .conceptMatches(parseDoubleMap(matchNode, "conceptMatches"))
                    .skillRelevance(parseDoubleMap(matchNode, "skillRelevance"))
                    .explanation(matchNode.path("explanation").asText())
                    .recommendation(matchNode.path("recommendation").asText())
                    .build();
            }
            
            return createDefaultMatch();
        } catch (Exception e) {
            log.error("Failed to parse semantic match: {}", e.getMessage(), e);
            return createDefaultMatch();
        }
    }
    
    private Map<String, Double> parseDoubleMap(JsonNode node, String fieldName) {
        Map<String, Double> map = new HashMap<>();
        JsonNode mapNode = node.path(fieldName);
        
        if (mapNode.isObject()) {
            mapNode.fields().forEachRemaining(entry -> 
                map.put(entry.getKey(), entry.getValue().asDouble(0.0))
            );
        }
        
        return map;
    }
    
    private SemanticMatchResponseDto createDefaultMatch() {
        return SemanticMatchResponseDto.builder()
            .semanticSimilarity(50.0)
            .matchQuality("FAIR")
            .conceptMatches(new HashMap<>())
            .skillRelevance(new HashMap<>())
            .explanation("Semantic analysis unavailable. Manual review recommended.")
            .recommendation("Review candidate profile manually for detailed assessment.")
            .build();
    }
}
