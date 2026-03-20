package az.edu.itbrains.devinsight2.service.question;

import az.edu.itbrains.devinsight2.model.interview.InterviewQuestion;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnswerEvaluationService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ai.anthropic.api-key}")
    private String apiKey;

    @Value("${ai.anthropic.api-url}")
    private String apiUrl;

    @Value("${ai.anthropic.model}")
    private String model;

    @Value("${ai.anthropic.max-tokens:2000}")
    private Integer maxTokens;

    /**
     * Istifadəçinin cavabını qiymətləndir
     */
    public void evaluateAnswer(InterviewQuestion question) {
        try {
            if (question == null || question.getUserTranscript() == null) {
                throw new IllegalArgumentException("Question or transcript cannot be null");
            }

            log.info("Starting answer evaluation for question: {}", question.getId());

            // Build prompt
            String prompt = buildEvaluationPrompt(question);

            // Call Claude API
            String aiResponse = callClaudeAPI(prompt);

            // Parse evaluation
            Map<String, Object> evaluation = parseEvaluation(aiResponse);

            // Update question with scores
            question.setRelevanceScore(getIntValue(evaluation, "relevanceScore", 50));
            question.setCompletenessScore(getIntValue(evaluation, "completenessScore", 50));
            question.setClarityScore(getIntValue(evaluation, "clarityScore", 50));
            question.setConfidenceScore(getIntValue(evaluation, "confidenceScore", 50));

            // Calculate overall score
            question.calculateOverallScore();

            // Set feedback
            question.setAiFeedback(getStringValue(evaluation, "feedback", "No feedback available"));
            question.setStrengths(objectMapper.writeValueAsString(
                    evaluation.getOrDefault("strengths", List.of())
            ));
            question.setWeaknesses(objectMapper.writeValueAsString(
                    evaluation.getOrDefault("weaknesses", List.of())
            ));
            question.setSuggestions(objectMapper.writeValueAsString(
                    evaluation.getOrDefault("suggestions", List.of())
            ));

            log.info("Answer evaluation completed. Overall score: {}", question.getOverallScore());

        } catch (Exception e) {
            log.error("Answer evaluation failed: ", e);
            throw new RuntimeException("Failed to evaluate answer: " + e.getMessage());
        }
    }

    /**
     * Evaluation prompt'unu yaratdı
     */
    private String buildEvaluationPrompt(InterviewQuestion question) {
        String questionText = question.getQuestion().getTitle();
        String userAnswer = question.getUserTranscript();

        return String.format("""
            You are a professional interview evaluator. Evaluate this interview answer.
            
            **Question:** %s
            **Difficulty Level:** %s
            **User's Answer:** %s
            
            Please evaluate the answer on these criteria (0-100 for each):
            1. Relevance - How well does the answer address the question?
            2. Completeness - Does it cover all key points and aspects?
            3. Clarity - Is the answer clear, well-structured, and easy to follow?
            4. Confidence - Does the speaker sound confident and knowledgeable?
            
            Respond in JSON format ONLY (no markdown, no extra text):
            {
              "relevanceScore": <0-100>,
              "completenessScore": <0-100>,
              "clarityScore": <0-100>,
              "confidenceScore": <0-100>,
              "feedback": "<detailed, constructive feedback (2-3 sentences)>",
              "strengths": ["strength1", "strength2", "strength3"],
              "weaknesses": ["weakness1", "weakness2"],
              "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
            }
            
            Be fair, constructive, and specific. Focus on improvement opportunities.
            """,
                questionText,
                question.getQuestion().getDifficulty(),
                userAnswer
        );
    }

    /**
     * Claude API'yə çağrı et
     */
    private String callClaudeAPI(String prompt) {
        try {
            log.debug("Calling Claude API with model: {}", model);

            if (apiKey == null || apiKey.isEmpty()) {
                throw new RuntimeException("Claude API key not configured");
            }

            if (apiUrl == null || apiUrl.isEmpty()) {
                throw new RuntimeException("Claude API URL not configured");
            }

            // Request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", prompt)
            ));

            // Build WebClient
            WebClient webClient = webClientBuilder
                    .baseUrl(apiUrl)
                    .defaultHeader("x-api-key", apiKey)
                    .defaultHeader("anthropic-version", "2023-06-01")
                    .defaultHeader("content-type", "application/json")
                    .build();

            // Make request
            String response = webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                            status -> !status.is2xxSuccessful(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .flatMap(body -> {
                                        log.error("Claude API error: {}", body);
                                        return null;
                                    })
                    )
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null || response.isEmpty()) {
                throw new RuntimeException("Empty response from Claude API");
            }

            // Extract text from response
            JsonNode jsonNode = objectMapper.readTree(response);
            String responseText = jsonNode.get("content").get(0).get("text").asText();

            log.debug("Claude API response received, length: {}", responseText.length());

            return responseText;

        } catch (Exception e) {
            log.error("Claude API call failed: ", e);
            throw new RuntimeException("Failed to call Claude API: " + e.getMessage());
        }
    }

    /**
     * AI response'unu parse et
     */
    private Map<String, Object> parseEvaluation(String aiResponse) {
        try {
            log.debug("Parsing evaluation response");

            // Extract JSON from response
            String jsonStr = aiResponse;

            // If wrapped in markdown code block
            if (aiResponse.contains("```json")) {
                jsonStr = aiResponse.substring(
                        aiResponse.indexOf("```json") + 7,
                        aiResponse.lastIndexOf("```")
                ).trim();
            } else if (aiResponse.contains("```")) {
                jsonStr = aiResponse.substring(
                        aiResponse.indexOf("```") + 3,
                        aiResponse.lastIndexOf("```")
                ).trim();
            }

            // Remove any leading/trailing whitespace
            jsonStr = jsonStr.trim();
            if (jsonStr.startsWith("json")) {
                jsonStr = jsonStr.substring(4).trim();
            }

            log.debug("Extracted JSON for parsing, length: {}", jsonStr.length());

            Map<String, Object> evaluation = objectMapper.readValue(
                    jsonStr,
                    new TypeReference<Map<String, Object>>() {}
            );

            log.debug("Evaluation parsed successfully");
            return evaluation;

        } catch (Exception e) {
            log.error("Failed to parse evaluation response: {}", aiResponse, e);
            return getDefaultEvaluation();
        }
    }

    /**
     * Default evaluation əgər parsing fail olursa
     */
    private Map<String, Object> getDefaultEvaluation() {
        Map<String, Object> defaultEval = new HashMap<>();
        defaultEval.put("relevanceScore", 50);
        defaultEval.put("completenessScore", 50);
        defaultEval.put("clarityScore", 50);
        defaultEval.put("confidenceScore", 50);
        defaultEval.put("feedback", "Evaluation could not be completed. Please try again.");
        defaultEval.put("strengths", List.of("Attempted to answer"));
        defaultEval.put("weaknesses", List.of("Evaluation unavailable"));
        defaultEval.put("suggestions", List.of("Please retry the answer"));
        return defaultEval;
    }

    /**
     * Helper - Integer value al
     */
    private Integer getIntValue(Map<String, Object> map, String key, Integer defaultValue) {
        try {
            Object value = map.get(key);
            if (value instanceof Integer) {
                return (Integer) value;
            }
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
            return defaultValue;
        } catch (Exception e) {
            log.warn("Failed to get int value for key: {}", key, e);
            return defaultValue;
        }
    }

    /**
     * Helper - String value al
     */
    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        try {
            Object value = map.get(key);
            return value != null ? value.toString() : defaultValue;
        } catch (Exception e) {
            log.warn("Failed to get string value for key: {}", key, e);
            return defaultValue;
        }
    }
}