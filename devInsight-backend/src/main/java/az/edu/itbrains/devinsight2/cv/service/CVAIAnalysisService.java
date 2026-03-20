package az.edu.itbrains.devinsight2.cv.service;

import az.edu.itbrains.devinsight2.cv.dto.CVAnalysisResultDto;
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for AI-powered CV analysis using Anthropic's Claude API
 * IMPORTANT: Uses unique bean name "cvAIAnalysisService" to avoid Spring bean conflicts
 */
@Service("cvAIAnalysisService")
@Slf4j
@RequiredArgsConstructor
public class CVAIAnalysisService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = 
        "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 1024;
    

    public CVAnalysisResultDto analyzeCV(String cvText) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured - using MOCK DATA for testing");
            return createMockAnalysisResult();
        }
        
        if (cvText == null || cvText.trim().isEmpty()) {
            log.warn("CV text is empty, cannot analyze");
            return createEmptyResult();
        }
        
        try {
            log.debug("Starting CV analysis with Claude API");
            String analysisJson = callClaudeAPI(cvText);
            return parseAnalysisResult(analysisJson);
        } catch (Exception e) {
            log.error("CV analysis failed: {}", e.getMessage(), e);
            return createEmptyResult();
        }
    }
    
        /**
         * Call Claude API to analyze CV text
         */
    private String callClaudeAPI(String cvText) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");
        
        String prompt = buildAnalysisPrompt(cvText);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", CLAUDE_MODEL);
        requestBody.put("max_tokens", MAX_TOKENS);  
        requestBody.put("messages", Collections.singletonList(
            Map.of("role", "user", "content", prompt)
        ));
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                CLAUDE_API_URL,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.debug("Claude API response received successfully");
                return objectMapper.writeValueAsString(response.getBody());
            } else {
                log.error("Claude API returned status: {}", response.getStatusCode());
                return "{}";
            }
        } catch (Exception e) {
            log.error("Error calling Claude API: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Build prompt for Claude to analyze CV
     */
    private String buildAnalysisPrompt(String cvText) {
        return """
            Analyze the following CV and extract structured information in JSON format.
            Return ONLY valid JSON without markdown formatting or code blocks.
            
            CV Text:
            %s
            
            Respond with a JSON object containing:
            {
                "skills": ["skill1", "skill2", ...],
                "experienceLevel": "JUNIOR|MID|SENIOR",
                "categories": ["category1", "category2", ...],
                "yearsOfExperience": number,
                "education": "education details",
                "languages": ["language1", "language2", ...],
                "summary": "brief summary"
            }
            """.formatted(cvText);
    }
    
    /**
     * Parse Claude API response and extract analysis results
     */
    private CVAnalysisResultDto parseAnalysisResult(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            
            // Extract content from Claude's response structure
            JsonNode contentArray = rootNode.path("content");
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                
                // Parse the analysis JSON from Claude's response
                JsonNode analysisNode = objectMapper.readTree(content);
                
                return CVAnalysisResultDto.builder()
                    .skills(parseList(analysisNode, "skills"))
                    .experienceLevel(analysisNode.path("experienceLevel").asText("UNKNOWN"))
                    .categories(parseList(analysisNode, "categories"))
                    .yearsOfExperience(analysisNode.path("yearsOfExperience").asInt(0))
                    .education(analysisNode.path("education").asText(""))
                    .languages(parseList(analysisNode, "languages"))
                    .summary(analysisNode.path("summary").asText(""))
                    .build();
            }
            
            log.warn("Unexpected Claude API response structure");
            return createEmptyResult();
        } catch (Exception e) {
            log.error("Failed to parse Claude API response: {}", e.getMessage(), e);
            return createEmptyResult();
        }
    }
    
    /**
     * Parse list from JSON node
     */
    private List<String> parseList(JsonNode node, String fieldName) {
        JsonNode fieldNode = node.path(fieldName);
        if (fieldNode.isArray()) {
            List<String> list = new ArrayList<>();
            for (JsonNode item : fieldNode) {
                list.add(item.asText());
            }
            return list;
        }
        return new ArrayList<>();
    }
    
    /**
     * Create empty result when API is unavailable or analysis fails
     */
    private CVAnalysisResultDto createEmptyResult() {
        return CVAnalysisResultDto.builder()
            .skills(new ArrayList<>())
            .experienceLevel("UNKNOWN")
            .categories(new ArrayList<>())
            .yearsOfExperience(0)
            .education("")
            .languages(new ArrayList<>())
            .summary("Analysis not available")
            .build();
    }
    
    /**
     * Creates mock CV analysis data for testing when API key is not available
     * This simulates what Claude API would return
     */
    private CVAnalysisResultDto createMockAnalysisResult() {
        return CVAnalysisResultDto.builder()
            .skills(Arrays.asList(
                // Frontend
                "React", "JavaScript", "TypeScript", "HTML", "CSS", 
                "Redux", "Tailwind CSS", "Material-UI",
                // Backend
                "Java", "Spring Boot", "Node.js", "Express.js",
                "REST API", "Microservices",
                // Database
                "PostgreSQL", "MongoDB", "MySQL", "Redis",
                // DevOps & Tools
                "Git", "Docker", "AWS", "CI/CD", "Jenkins",
                // Other
                "Agile", "Scrum", "Problem Solving", "Team Leadership"
            ))
            .experienceLevel("SENIOR")
            .categories(Arrays.asList(
                "Full-stack", "Backend", "Frontend", "DevOps"
            ))
            .yearsOfExperience(5)
            .education("Bachelor's Degree in Computer Science from Azerbaijan State Oil and Industry University")
            .languages(Arrays.asList(
                "Azerbaijani (Native)",
                "English (Fluent)", 
                "Turkish (Professional)",
                "Russian (Intermediate)"
            ))
            .summary("Highly experienced full-stack software engineer with 5+ years of expertise " +
                    "in building scalable web applications. Strong proficiency in React, Node.js, " +
                    "Java Spring Boot, and modern cloud technologies. Proven track record in leading " +
                    "development teams, implementing CI/CD pipelines, and delivering high-quality " +
                    "solutions. Passionate about clean code, best practices, and continuous learning. " +
                    "Excellent problem-solving abilities and strong communication skills.")
            .build();
    }
}
