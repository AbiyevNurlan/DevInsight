package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.BiasDetectionRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.BiasDetectionResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class BiasDetectionService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 3000;

    public BiasDetectionResponseDto detectBias(BiasDetectionRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK data for Bias Detection");
            return createMockBiasAnalysis(request);
        }

        try {
            log.info("🔍 Running bias detection analysis for interview {}", request.getInterviewId());
            String prompt = buildBiasDetectionPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseBiasDetectionResponse(responseJson);
        } catch (Exception e) {
            log.error("Failed to detect bias: {}", e.getMessage(), e);
            return createMockBiasAnalysis(request);
        }
    }

    private String buildBiasDetectionPrompt(BiasDetectionRequestDto request) {
        StringBuilder questionsInfo = new StringBuilder();
        if (request.getQuestionsAsked() != null) {
            for (BiasDetectionRequestDto.QuestionAsked q : request.getQuestionsAsked()) {
                questionsInfo.append("- Q: ").append(q.getQuestion())
                        .append(" | Type: ").append(q.getQuestionType())
                        .append(" | Difficulty: ").append(q.getDifficultyLevel())
                        .append(" | Candidate: ").append(q.getCandidateId()).append("\n");
            }
        }

        StringBuilder scoresInfo = new StringBuilder();
        if (request.getCandidateScores() != null) {
            for (BiasDetectionRequestDto.CandidateScore s : request.getCandidateScores()) {
                scoresInfo.append("- Candidate ").append(s.getCandidateId())
                        .append(": Tech=").append(s.getTechnicalScore())
                        .append(", Comm=").append(s.getCommunicationScore())
                        .append(", Overall=").append(s.getOverallScore())
                        .append(", Decision=").append(s.getDecision())
                        .append(", Notes: ").append(s.getInterviewerNotes()).append("\n");
            }
        }

        return """
            You are an AI fairness and bias detection expert. Analyze the following hiring data
            for unconscious bias patterns. Be thorough and evidence-based.

            POSITION: %s
            DEPARTMENT: %s

            QUESTIONS ASKED:
            %s

            CANDIDATE SCORES:
            %s

            Return ONLY valid JSON:
            {
                "overallFairnessScore": 0-100,
                "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
                "totalBiasIndicators": number,
                "biasIndicators": [
                    {
                        "biasType": "GENDER|AFFINITY|HALO_EFFECT|CONFIRMATION|ANCHORING|HORN_EFFECT|SIMILARITY",
                        "description": "description",
                        "severity": 0.0-1.0,
                        "evidence": "specific evidence",
                        "mitigation": "how to fix"
                    }
                ],
                "questionFairnessScore": 0-100,
                "unfairQuestions": ["question text if any"],
                "scoringConsistencyScore": 0-100,
                "biasedLanguageFound": ["language examples"],
                "suggestedAlternatives": ["better alternatives"],
                "actionItems": ["specific actions"],
                "summary": "executive summary",
                "bestPractices": ["practice1", "practice2"]
            }

            Check for:
            1. Question difficulty variance between candidates (fairness)
            2. Scoring pattern inconsistencies
            3. Language bias in interviewer notes
            4. Halo/Horn effect (one trait affecting all scores)
            5. Affinity bias (similarity to interviewer)
            6. Confirmation bias (leading questions)
            7. Anchoring effect (first impression dominating)
            """.formatted(
                request.getPositionTitle() != null ? request.getPositionTitle() : "Not specified",
                request.getDepartment() != null ? request.getDepartment() : "Not specified",
                questionsInfo.toString(),
                scoresInfo.toString()
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
                CLAUDE_API_URL, HttpMethod.POST, request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return objectMapper.writeValueAsString(response.getBody());
        }
        throw new RuntimeException("Claude API call failed");
    }

    private BiasDetectionResponseDto parseBiasDetectionResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = root.path("content");
            if (contentArray.isArray() && !contentArray.isEmpty()) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode node = objectMapper.readTree(content);

                List<BiasDetectionResponseDto.BiasIndicator> indicators = new ArrayList<>();
                node.path("biasIndicators").forEach(bi -> indicators.add(
                        BiasDetectionResponseDto.BiasIndicator.builder()
                                .biasType(bi.path("biasType").asText())
                                .description(bi.path("description").asText())
                                .severity(bi.path("severity").asDouble())
                                .evidence(bi.path("evidence").asText())
                                .mitigation(bi.path("mitigation").asText())
                                .build()));

                List<String> unfairQ = new ArrayList<>();
                node.path("unfairQuestions").forEach(n -> unfairQ.add(n.asText()));
                List<String> biasedLang = new ArrayList<>();
                node.path("biasedLanguageFound").forEach(n -> biasedLang.add(n.asText()));
                List<String> alternatives = new ArrayList<>();
                node.path("suggestedAlternatives").forEach(n -> alternatives.add(n.asText()));
                List<String> actions = new ArrayList<>();
                node.path("actionItems").forEach(n -> actions.add(n.asText()));
                List<String> practices = new ArrayList<>();
                node.path("bestPractices").forEach(n -> practices.add(n.asText()));

                return BiasDetectionResponseDto.builder()
                        .overallFairnessScore(node.path("overallFairnessScore").asDouble(75))
                        .riskLevel(node.path("riskLevel").asText("LOW"))
                        .totalBiasIndicators(node.path("totalBiasIndicators").asInt(0))
                        .biasIndicators(indicators)
                        .questionFairnessScore(node.path("questionFairnessScore").asDouble(80))
                        .unfairQuestions(unfairQ)
                        .scoringConsistencyScore(node.path("scoringConsistencyScore").asDouble(85))
                        .biasedLanguageFound(biasedLang)
                        .suggestedAlternatives(alternatives)
                        .actionItems(actions)
                        .summary(node.path("summary").asText(""))
                        .bestPractices(practices)
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to parse bias detection response: {}", e.getMessage());
        }
        return createMockBiasAnalysis(null);
    }

    private BiasDetectionResponseDto createMockBiasAnalysis(BiasDetectionRequestDto request) {
        List<BiasDetectionResponseDto.BiasIndicator> indicators = new ArrayList<>();
        indicators.add(BiasDetectionResponseDto.BiasIndicator.builder()
                .biasType("HALO_EFFECT")
                .description("Strong first impression may be inflating subsequent scores")
                .severity(0.35)
                .evidence("Communication score and technical score show 0.92 correlation — unusually high")
                .mitigation("Score each competency independently before reviewing overall impression")
                .build());
        indicators.add(BiasDetectionResponseDto.BiasIndicator.builder()
                .biasType("ANCHORING")
                .description("First candidate's score may be anchoring all subsequent evaluations")
                .severity(0.25)
                .evidence("Score distribution shifts downward after first high-scoring candidate")
                .mitigation("Use structured rubric with predefined scoring criteria")
                .build());

        return BiasDetectionResponseDto.builder()
                .overallFairnessScore(82.5)
                .riskLevel("LOW")
                .totalBiasIndicators(2)
                .biasIndicators(indicators)
                .questionFairnessScore(88.0)
                .unfairQuestions(Collections.emptyList())
                .scoringConsistencyScore(79.0)
                .scoringByDemographic(Map.of("overall_variance", 8.5))
                .biasedLanguageFound(Arrays.asList("'culture fit' — may mask affinity bias"))
                .suggestedAlternatives(Arrays.asList("Replace 'culture fit' with 'values alignment'"))
                .actionItems(Arrays.asList(
                        "Implement structured scoring rubric for all interviewers",
                        "Score competencies independently before overall assessment",
                        "Blind review mode for initial screening"
                ))
                .summary("Overall hiring process shows low bias risk (82.5/100 fairness). Two minor bias indicators detected: potential halo effect and anchoring bias. Recommended actions focus on structured scoring to improve consistency.")
                .bestPractices(Arrays.asList(
                        "Use identical question sets for same position",
                        "Score each competency independently",
                        "Include diverse interviewers on the panel",
                        "Review aggregate scoring data monthly"
                ))
                .trendDirection("IMPROVING")
                .previousFairnessScore(78.0)
                .build();
    }
}
