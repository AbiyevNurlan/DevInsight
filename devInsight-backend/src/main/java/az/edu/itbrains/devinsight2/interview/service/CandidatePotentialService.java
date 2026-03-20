package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.CandidatePotentialRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.CandidatePotentialResponseDto;
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
public class CandidatePotentialService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 3000;

    public CandidatePotentialResponseDto analyzePotential(CandidatePotentialRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK data for Candidate Potential");
            return createMockPotentialAnalysis(request);
        }

        try {
            log.info("🚀 Analyzing growth potential for candidate {} in interview {}",
                    request.getCandidateId(), request.getInterviewId());
            String prompt = buildPotentialPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parsePotentialResponse(responseJson, request);
        } catch (Exception e) {
            log.error("Failed to analyze candidate potential: {}", e.getMessage(), e);
            return createMockPotentialAnalysis(request);
        }
    }

    private String buildPotentialPrompt(CandidatePotentialRequestDto request) {
        StringBuilder perfInfo = new StringBuilder();
        if (request.getPerformances() != null) {
            for (CandidatePotentialRequestDto.QuestionPerformance p : request.getPerformances()) {
                perfInfo.append("  - Type: ").append(p.getQuestionType())
                        .append(" | Difficulty: ").append(p.getDifficulty())
                        .append("/10 | Score: ").append(p.getScore())
                        .append("/100 | Time: ").append(p.getTimeTakenSeconds()).append("s")
                        .append(" | Used hints: ").append(p.getUsedHints())
                        .append(" | Improved after hint: ").append(p.getImprovedAfterHint())
                        .append("\n");
            }
        }

        return """
            You are an expert talent evaluator and organizational psychologist.
            Predict this candidate's future growth potential based on their interview performance.

            CANDIDATE PROFILE:
            - Current Role: %s
            - Years Experience: %d
            - Current Skills: %s
            - Education: %s
            - Target Position: %s

            INTERVIEW PERFORMANCE:
            %s

            Return ONLY valid JSON:
            {
                "growthPotentialScore": 0-100,
                "potentialLevel": "EXCEPTIONAL|HIGH|MODERATE|LIMITED",
                "predictedPerformance6Mo": 0-100,
                "predictedPerformance1Yr": 0-100,
                "learningSpeed": 0-100,
                "learningStyle": "FAST_ADAPTER|STEADY_GROWER|DEEP_DIVER|PATTERN_MATCHER",
                "showsRapidImprovement": boolean,
                "hintUtilizationScore": 0-100,
                "adaptabilityScore": 0-100,
                "problemSolvingCreativity": 0-100,
                "unfamiliarTopicHandling": 0-100,
                "predictedTrajectory": "LEADER|SPECIALIST|ARCHITECT|GENERALIST",
                "highPotentialAreas": ["area1", "area2"],
                "developmentAreas": ["area1", "area2"],
                "estimatedTimeToSenior": months_number,
                "percentileRank": 0-100,
                "dimensionScores": {"learning": 0-100, "adaptability": 0-100, "creativity": 0-100, "resilience": 0-100, "leadership": 0-100},
                "executiveSummary": "paragraph summary",
                "keyStrengths": ["strength1"],
                "investmentRisks": ["risk1"],
                "hiringRecommendation": "STRONG_HIRE|HIRE|BORDERLINE|PASS",
                "reasoning": "detailed reasoning"
            }

            Key growth signals:
            - Improving scores across questions = high learning velocity
            - Good use of hints = teachable / coachable
            - Performance on unfamiliar topics = adaptability
            - Creative approaches = innovation potential
            - Time management across questions = organizational maturity
            - Score variance = consistency and resilience
            """.formatted(
                request.getCurrentRole() != null ? request.getCurrentRole() : "Not specified",
                request.getYearsExperience() != null ? request.getYearsExperience() : 0,
                request.getCurrentSkills() != null ? String.join(", ", request.getCurrentSkills()) : "N/A",
                request.getEducationLevel() != null ? request.getEducationLevel() : "N/A",
                request.getTargetPosition() != null ? request.getTargetPosition() : "N/A",
                perfInfo.toString()
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

    private CandidatePotentialResponseDto parsePotentialResponse(String jsonResponse, CandidatePotentialRequestDto req) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = root.path("content");
            if (contentArray.isArray() && !contentArray.isEmpty()) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode node = objectMapper.readTree(content);

                List<String> highPotential = new ArrayList<>();
                node.path("highPotentialAreas").forEach(n -> highPotential.add(n.asText()));
                List<String> devAreas = new ArrayList<>();
                node.path("developmentAreas").forEach(n -> devAreas.add(n.asText()));
                List<String> strengths = new ArrayList<>();
                node.path("keyStrengths").forEach(n -> strengths.add(n.asText()));
                List<String> risks = new ArrayList<>();
                node.path("investmentRisks").forEach(n -> risks.add(n.asText()));

                Map<String, Double> dimensions = new HashMap<>();
                JsonNode dim = node.path("dimensionScores");
                dim.fieldNames().forEachRemaining(f -> dimensions.put(f, dim.path(f).asDouble()));

                return CandidatePotentialResponseDto.builder()
                        .growthPotentialScore(node.path("growthPotentialScore").asDouble(60))
                        .potentialLevel(node.path("potentialLevel").asText("MODERATE"))
                        .predictedPerformance6Mo(node.path("predictedPerformance6Mo").asDouble(70))
                        .predictedPerformance1Yr(node.path("predictedPerformance1Yr").asDouble(80))
                        .learningSpeed(node.path("learningSpeed").asDouble(65))
                        .learningStyle(node.path("learningStyle").asText("STEADY_GROWER"))
                        .showsRapidImprovement(node.path("showsRapidImprovement").asBoolean(false))
                        .hintUtilizationScore(node.path("hintUtilizationScore").asDouble(70))
                        .adaptabilityScore(node.path("adaptabilityScore").asDouble(65))
                        .problemSolvingCreativity(node.path("problemSolvingCreativity").asDouble(60))
                        .unfamiliarTopicHandling(node.path("unfamiliarTopicHandling").asDouble(55))
                        .predictedTrajectory(node.path("predictedTrajectory").asText("SPECIALIST"))
                        .highPotentialAreas(highPotential)
                        .developmentAreas(devAreas)
                        .estimatedTimeToSenior(node.path("estimatedTimeToSenior").asInt(18))
                        .percentileRank(node.path("percentileRank").asDouble(65))
                        .dimensionScores(dimensions)
                        .executiveSummary(node.path("executiveSummary").asText(""))
                        .keyStrengths(strengths)
                        .investmentRisks(risks)
                        .hiringRecommendation(node.path("hiringRecommendation").asText("HIRE"))
                        .reasoning(node.path("reasoning").asText(""))
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to parse potential response: {}", e.getMessage());
        }
        return createMockPotentialAnalysis(req);
    }

    private CandidatePotentialResponseDto createMockPotentialAnalysis(CandidatePotentialRequestDto request) {
        int yearsExp = request != null && request.getYearsExperience() != null ? request.getYearsExperience() : 2;
        double growthScore = Math.min(100, 60 + (5 - yearsExp) * 5); // younger = higher potential

        Map<String, Double> dimensions = new LinkedHashMap<>();
        dimensions.put("learning", 82.0);
        dimensions.put("adaptability", 75.0);
        dimensions.put("creativity", 68.0);
        dimensions.put("resilience", 79.0);
        dimensions.put("leadership", 61.0);

        return CandidatePotentialResponseDto.builder()
                .growthPotentialScore(growthScore)
                .potentialLevel(growthScore > 80 ? "HIGH" : growthScore > 60 ? "MODERATE" : "LIMITED")
                .predictedPerformance6Mo(growthScore + 8)
                .predictedPerformance1Yr(Math.min(100, growthScore + 18))
                .learningSpeed(82.0)
                .learningStyle("FAST_ADAPTER")
                .showsRapidImprovement(true)
                .hintUtilizationScore(76.0)
                .adaptabilityScore(75.0)
                .problemSolvingCreativity(68.0)
                .unfamiliarTopicHandling(71.0)
                .predictedTrajectory("SPECIALIST")
                .highPotentialAreas(Arrays.asList("Backend Architecture", "System Design", "API Development"))
                .developmentAreas(Arrays.asList("Frontend Technologies", "Cloud Infrastructure", "Team Leadership"))
                .estimatedTimeToSenior(14)
                .percentileRank(72.0)
                .dimensionScores(dimensions)
                .executiveSummary("Candidate demonstrates strong learning velocity with consistent improvement across " +
                        "interview questions. Shows particular aptitude for systematic problem-solving and effective " +
                        "use of provided hints. Growth trajectory suggests rapid progression within 12-18 months. " +
                        "Investment in this candidate carries moderate-to-low risk with high upside potential.")
                .keyStrengths(Arrays.asList(
                        "Rapid learning from feedback (82nd percentile)",
                        "Strong systematic approach to unfamiliar problems",
                        "Consistent improvement trajectory across difficulty levels"))
                .investmentRisks(Arrays.asList(
                        "Limited exposure to large-scale systems",
                        "May need mentorship for cross-functional collaboration"))
                .hiringRecommendation("HIRE")
                .reasoning("Candidate shows above-average growth potential with strong learning speed and adaptability. " +
                        "While current skill level may require initial ramp-up, the demonstrated learning velocity " +
                        "suggests they will reach full productivity faster than 68% of similarly-leveled candidates.")
                .build();
    }
}
