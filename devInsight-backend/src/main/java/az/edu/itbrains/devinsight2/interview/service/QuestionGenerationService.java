package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.GeneratedQuestionDto;
import az.edu.itbrains.devinsight2.interview.dto.QuestionGenerationRequestDto;
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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class QuestionGenerationService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Generate interview questions based on role and candidate profile
     */
    public List<GeneratedQuestionDto> generateQuestions(QuestionGenerationRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK data for testing");
            return createMockQuestions(request);
        }
        
        try {
            log.info("Generating {} questions for role: {}, level: {}", 
                request.getQuestionCount(), request.getRole(), request.getExperienceLevel());
            
            String prompt = buildQuestionPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseQuestions(responseJson);
            
        } catch (Exception e) {
            log.error("Failed to generate questions: {}", e.getMessage(), e);
            log.warn("Falling back to MOCK data");
            return createMockQuestions(request);
        }
    }
    
    /**
     * Build prompt for Claude to generate questions
     */
    private String buildQuestionPrompt(QuestionGenerationRequestDto request) {
        String skillsList = String.join(", ", request.getSkills());
        
        return """
            Generate %d interview questions for a %s position at %s level.
            Required skills: %s
            Difficulty: %s
            
            Return ONLY valid JSON without markdown formatting or code blocks.
            
            Format:
            {
                "questions": [
                    {
                        "question": "question text",
                        "type": "TECHNICAL|BEHAVIORAL|SITUATIONAL",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "expectedKeywords": ["keyword1", "keyword2"],
                        "idealAnswer": "brief ideal answer",
                        "maxScore": 10,
                        "evaluationCriteria": ["criterion1", "criterion2"]
                    }
                ]
            }
            
            Mix question types:
            - 60%% technical questions testing actual skills
            - 25%% behavioral questions (teamwork, problem-solving)
            - 15%% situational questions (how would you handle...)
            
            Make questions specific, realistic, and appropriate for the experience level.
            """.formatted(
                request.getQuestionCount(),
                request.getRole(),
                request.getExperienceLevel(),
                skillsList,
                request.getDifficulty()
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
     * Parse questions from Claude response
     */
    private List<GeneratedQuestionDto> parseQuestions(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode questionsNode = objectMapper.readTree(content);
                JsonNode questionsArray = questionsNode.path("questions");
                
                List<GeneratedQuestionDto> questions = new ArrayList<>();
                for (JsonNode questionNode : questionsArray) {
                    questions.add(GeneratedQuestionDto.builder()
                        .question(questionNode.path("question").asText())
                        .type(questionNode.path("type").asText("TECHNICAL"))
                        .difficulty(questionNode.path("difficulty").asText("MEDIUM"))
                        .expectedKeywords(parseStringList(questionNode, "expectedKeywords"))
                        .idealAnswer(questionNode.path("idealAnswer").asText(""))
                        .maxScore(questionNode.path("maxScore").asInt(10))
                        .evaluationCriteria(parseStringList(questionNode, "evaluationCriteria"))
                        .build());
                }
                
                return questions;
            }
            
            return createDefaultQuestions();
        } catch (Exception e) {
            log.error("Failed to parse questions: {}", e.getMessage(), e);
            return createDefaultQuestions();
        }
    }
    
    private List<String> parseStringList(JsonNode node, String fieldName) {
        JsonNode arrayNode = node.path(fieldName);
        List<String> result = new ArrayList<>();
        if (arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                result.add(item.asText());
            }
        }
        return result;
    }
    
    /**
     * Create default questions as fallback
     */
    private List<GeneratedQuestionDto> createDefaultQuestions() {
        return List.of(
            GeneratedQuestionDto.builder()
                .question("Tell me about your experience with the technologies listed in your CV")
                .type("TECHNICAL")
                .difficulty("MEDIUM")
                .expectedKeywords(List.of("experience", "technology", "project"))
                .idealAnswer("Detailed explanation of technical experience")
                .maxScore(10)
                .evaluationCriteria(List.of("Clarity", "Depth", "Relevance"))
                .build(),
            GeneratedQuestionDto.builder()
                .question("Describe a challenging problem you solved recently")
                .type("BEHAVIORAL")
                .difficulty("MEDIUM")
                .expectedKeywords(List.of("problem", "solution", "approach"))
                .idealAnswer("Structured problem-solving approach")
                .maxScore(10)
                .evaluationCriteria(List.of("Problem-solving", "Communication", "Result"))
                .build()
        );
    }
    
    /**
     * Create realistic mock questions based on request parameters
     */
    private List<GeneratedQuestionDto> createMockQuestions(QuestionGenerationRequestDto request) {
        log.info("🎭 Generating {} MOCK questions for role: {}", request.getQuestionCount(), request.getRole());
        
        List<GeneratedQuestionDto> questions = new ArrayList<>();
        String role = request.getRole();
        String difficulty = request.getDifficulty();
        int count = request.getQuestionCount() != null ? request.getQuestionCount() : 5;
        
        // Technical questions based on role
        if (count > 0 && role.toLowerCase().contains("developer")) {
            questions.add(GeneratedQuestionDto.builder()
                .question("Explain the difference between REST and GraphQL APIs. When would you choose one over the other?")
                .type("TECHNICAL")
                .difficulty(difficulty)
                .expectedKeywords(List.of("REST", "GraphQL", "API", "performance", "flexibility", "caching"))
                .idealAnswer("REST uses fixed endpoints while GraphQL allows flexible queries. REST is simpler but GraphQL reduces over-fetching. Choice depends on use case.")
                .maxScore(10)
                .evaluationCriteria(List.of("Technical accuracy", "Use case understanding", "Comparison depth"))
                .build());
        }
        
        if (count > 1) {
            questions.add(GeneratedQuestionDto.builder()
                .question("Describe a time when you had to meet a tight deadline. How did you prioritize your tasks?")
                .type("BEHAVIORAL")
                .difficulty(difficulty)
                .expectedKeywords(List.of("deadline", "prioritization", "time management", "planning", "results"))
                .idealAnswer("Use STAR method: Situation, Task, Action, Result. Focus on prioritization strategy and outcome.")
                .maxScore(10)
                .evaluationCriteria(List.of("Clear structure", "Problem-solving approach", "Communication"))
                .build());
        }
        
        if (count > 2 && role.toLowerCase().contains("java")) {
            questions.add(GeneratedQuestionDto.builder()
                .question("What are the key differences between ArrayList and LinkedList in Java? Provide performance considerations.")
                .type("TECHNICAL")
                .difficulty(difficulty)
                .expectedKeywords(List.of("ArrayList", "LinkedList", "performance", "O(1)", "O(n)", "memory", "insertion"))
                .idealAnswer("ArrayList uses array with O(1) access, O(n) insertion. LinkedList has O(n) access, O(1) insertion at ends. Choose based on use pattern.")
                .maxScore(10)
                .evaluationCriteria(List.of("Data structure knowledge", "Performance analysis", "Practical usage"))
                .build());
        }
        
        if (count > 3) {
            questions.add(GeneratedQuestionDto.builder()
                .question("How do you handle disagreements with team members during code reviews?")
                .type("BEHAVIORAL")
                .difficulty(difficulty)
                .expectedKeywords(List.of("communication", "collaboration", "compromise", "respect", "technical discussion"))
                .idealAnswer("Focus on code quality, not personal preferences. Use data and examples. Be open to learning. Seek consensus.")
                .maxScore(10)
                .evaluationCriteria(List.of("Teamwork", "Communication skills", "Professional maturity"))
                .build());
        }
        
        if (count > 4 && role.toLowerCase().contains("spring")) {
            questions.add(GeneratedQuestionDto.builder()
                .question("Explain dependency injection in Spring Boot. What are the different types and when to use each?")
                .type("TECHNICAL")
                .difficulty(difficulty)
                .expectedKeywords(List.of("dependency injection", "Spring", "constructor", "setter", "field", "IoC", "autowired"))
                .idealAnswer("DI is IoC principle. Constructor injection (immutable), setter injection (optional), field injection (not recommended). Prefer constructor for required dependencies.")
                .maxScore(10)
                .evaluationCriteria(List.of("Framework knowledge", "Best practices", "Practical understanding"))
                .build());
        }
        
        // Add more generic questions to reach count
        while (questions.size() < count) {
            questions.add(GeneratedQuestionDto.builder()
                .question("What are your career goals for the next 2-3 years?")
                .type("GENERAL")
                .difficulty("EASY")
                .expectedKeywords(List.of("goals", "growth", "learning", "advancement"))
                .idealAnswer("Clear career progression plan aligned with role. Shows ambition and alignment with company.")
                .maxScore(10)
                .evaluationCriteria(List.of("Clarity", "Ambition", "Alignment"))
                .build());
        }
        
        log.info("✅ Generated {} MOCK questions successfully", questions.size());
        return questions.subList(0, Math.min(count, questions.size()));
    }
}
