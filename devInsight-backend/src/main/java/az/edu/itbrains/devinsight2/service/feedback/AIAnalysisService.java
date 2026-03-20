package az.edu.itbrains.devinsight2.service.feedback;

import az.edu.itbrains.devinsight2.model.core.Analysis;
import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.repository.audit.AnalysisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("unchecked")
public class AIAnalysisService {

    private final AnalysisRepository analysisRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ai.anthropic.api-key}")
    private String apiKey;

    @Value("${ai.anthropic.api-url}")
    private String apiUrl;

    @Value("${ai.anthropic.model}")
    private String model;

    @Value("${ai.anthropic.max-tokens}")
    private Integer maxTokens;

    @Transactional
    public Analysis analyzeSubmission(Submission submission) {
        long startTime = System.currentTimeMillis();

        try {
            Question question = submission.getQuestion();
            String code = submission.getCodeSubmission();

            // Build AI prompt
            String prompt = buildAnalysisPrompt(question, code);

            // Call Claude API
            String aiResponse = callClaudeAPI(prompt);

            // Parse response
            Map<String, Object> analysisData = parseAIResponse(aiResponse);

            // Create Analysis entity
            Analysis analysis = Analysis.builder()
                    .submission(submission)
                    .overallScore((Integer) analysisData.get("overallScore"))
                    .codeQualityScore((Integer) analysisData.get("codeQualityScore"))
                    .algorithmEfficiencyScore((Integer) analysisData.get("algorithmScore"))
                    .problemSolvingScore((Integer) analysisData.get("problemSolvingScore"))
                    .aiGeneratedFeedback((String) analysisData.get("feedback"))
                    .codeReview((String) analysisData.get("codeReview"))
                    .strengths(objectMapper.writeValueAsString(analysisData.get("strengths")))
                    .weaknesses(objectMapper.writeValueAsString(analysisData.get("weaknesses")))
                    .recommendations(objectMapper.writeValueAsString(analysisData.get("recommendations")))
                    .timeComplexity((String) analysisData.get("timeComplexity"))
                    .spaceComplexity((String) analysisData.get("spaceComplexity"))
                    .aiModel(model)
                    .analysisTimeMs((int) (System.currentTimeMillis() - startTime))
                    .build();

            return analysisRepository.save(analysis);

        } catch (Exception e) {
            log.error("Error analyzing submission: ", e);
            throw new RuntimeException("AI analysis failed: " + e.getMessage());
        }
    }

    private String buildAnalysisPrompt(Question question, String code) {
        return String.format("""
                        You are an expert technical interviewer. Analyze this code submission:
                        
                        **Question:** %s
                        **Difficulty:** %s
                        **Programming Language:** %s
                        
                        **Submitted Code:**
                        ```
                        %s
                        ```
                        
                        Provide a comprehensive analysis in JSON format with:
                        {
                          "overallScore": <0-100>,
                          "codeQualityScore": <0-100>,
                          "algorithmScore": <0-100>,
                          "problemSolvingScore": <0-100>,
                          "feedback": "<detailed feedback>",
                          "codeReview": "<line by line review>",
                          "strengths": ["strength1", "strength2"],
                          "weaknesses": ["weakness1", "weakness2"],
                          "recommendations": ["recommendation1", "recommendation2"],
                          "timeComplexity": "<O notation>",
                          "spaceComplexity": "<O notation>"
                        }
                        
                        Be constructive, specific, and helpful in your feedback.
                        """,
                question.getTitle(),
                question.getDifficulty(),
                question.getProgrammingLanguage(),
                code
        );
    }

    private String callClaudeAPI(String prompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", prompt)
            ));

            WebClient webClient = webClientBuilder
                    .baseUrl(apiUrl)
                    .defaultHeader("x-api-key", apiKey)
                    .defaultHeader("anthropic-version", "2023-06-01")
                    .defaultHeader("content-type", "application/json")
                    .build();

            String response = webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            // Extract text from Claude response
            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.get("content").get(0).get("text").asText();

        } catch (Exception e) {
            log.error("Claude API call failed: ", e);
            throw new RuntimeException("Failed to call Claude API: " + e.getMessage());
        }
    }

    private Map<String, Object> parseAIResponse(String aiResponse) {
        try {
            // Extract JSON from response (Claude might wrap it in markdown)
            String jsonStr = aiResponse;
            if (aiResponse.contains("```json")) {
                jsonStr = aiResponse.substring(
                        aiResponse.indexOf("```json") + 7,
                        aiResponse.lastIndexOf("```")
                ).trim();
            }

            return objectMapper.readValue(jsonStr, Map.class);

        } catch (Exception e) {
            log.error("Failed to parse AI response: ", e);

            // Return default values if parsing fails
            Map<String, Object> defaultResponse = new HashMap<>();
            defaultResponse.put("overallScore", 50);
            defaultResponse.put("codeQualityScore", 50);
            defaultResponse.put("algorithmScore", 50);
            defaultResponse.put("problemSolvingScore", 50);
            defaultResponse.put("feedback", "Analysis completed but response parsing failed.");
            defaultResponse.put("codeReview", "Unable to generate code review.");
            defaultResponse.put("strengths", List.of("Code submitted successfully"));
            defaultResponse.put("weaknesses", List.of("Analysis incomplete"));
            defaultResponse.put("recommendations", List.of("Please try again"));
            defaultResponse.put("timeComplexity", "Unknown");
            defaultResponse.put("spaceComplexity", "Unknown");

            return defaultResponse;
        }
    }

    public Analysis getAnalysisBySubmissionId(Long submissionId) {
        return analysisRepository.findBySubmissionId(submissionId)
                .orElseThrow(() -> new RuntimeException("Analysis not found for submission: " + submissionId));
    }
}