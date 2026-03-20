package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.TeamChemistryRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.TeamChemistryResponseDto;
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
public class TeamChemistryService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 3000;

    public TeamChemistryResponseDto predictTeamChemistry(TeamChemistryRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK data for Team Chemistry");
            return createMockChemistryAnalysis(request);
        }

        try {
            log.info("🧪 Predicting team chemistry for candidate {} with team {}",
                    request.getCandidateId(), request.getTeamName());
            String prompt = buildChemistryPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseChemistryResponse(responseJson, request);
        } catch (Exception e) {
            log.error("Failed to predict team chemistry: {}", e.getMessage(), e);
            return createMockChemistryAnalysis(request);
        }
    }

    private String buildChemistryPrompt(TeamChemistryRequestDto request) {
        StringBuilder membersInfo = new StringBuilder();
        if (request.getExistingMembers() != null) {
            for (TeamChemistryRequestDto.TeamMemberProfile member : request.getExistingMembers()) {
                membersInfo.append("  - Role: ").append(member.getRole())
                        .append(" | Communication: ").append(member.getCommunicationStyle())
                        .append(" | Work Pref: ").append(member.getWorkPreference())
                        .append(" | Satisfaction: ").append(member.getSatisfactionLevel()).append("/10\n");
            }
        }

        return """
            You are an expert organizational psychologist and team dynamics specialist.
            Predict how a new candidate would integrate with an existing team.

            CANDIDATE PROFILE:
            - Communication Style: %s
            - Work Preference: %s
            - Conflict Resolution: %s
            - Decision Making: %s
            - Values: %s
            - Leadership Style: %s
            - Extroversion Level: %.2f

            TEAM PROFILE:
            - Team Name: %s
            - Team Size: %d
            - Culture: %s
            - Project Type: %s

            EXISTING TEAM MEMBERS:
            %s

            Return ONLY valid JSON:
            {
                "chemistryScore": 0-100,
                "compatibilityLevel": "EXCELLENT|GOOD|MODERATE|LOW|RISKY",
                "cultureFitScore": 0-100,
                "collaborationPotential": 0-100,
                "predictedTeamRole": "LEADER|MEDIATOR|INNOVATOR|EXECUTOR|ANALYST",
                "roleGapFitScore": 0-100,
                "teamGapsTheyFill": ["gap1"],
                "potentialOverlaps": ["overlap1"],
                "interactions": [
                    {"memberRole": "role", "compatibilityScore": 0-100, "interactionType": "COMPLEMENTARY|NEUTRAL|POTENTIAL_FRICTION", "advice": "advice"}
                ],
                "potentialFrictions": ["friction1"],
                "synergyOpportunities": ["synergy1"],
                "conflictRisk": 0-100,
                "teamProductivityImpact": -20 to 30,
                "personalityDimensions": {"openness": 0-1, "conscientiousness": 0-1, "extroversion": 0-1, "agreeableness": 0-1, "neuroticism": 0-1},
                "summary": "paragraph summary",
                "onboardingTips": ["tip1"],
                "managementAdvice": "advice text",
                "teamDynamicsImpact": "description of impact"
            }

            Consider:
            - Complementary vs conflicting communication styles
            - Work preference compatibility
            - Team role gaps the candidate fills
            - Potential points of friction with existing members
            - Cultural fit and values alignment
            - Impact on overall team productivity and morale
            """.formatted(
                request.getCommunicationStyle() != null ? request.getCommunicationStyle() : "COLLABORATIVE",
                request.getWorkPreference() != null ? request.getWorkPreference() : "TEAM",
                request.getConflictResolution() != null ? request.getConflictResolution() : "COMPROMISE",
                request.getDecisionMaking() != null ? request.getDecisionMaking() : "DATA_DRIVEN",
                request.getValues() != null ? String.join(", ", request.getValues()) : "growth, innovation",
                request.getLeadershipStyle() != null ? request.getLeadershipStyle() : "DEMOCRATIC",
                request.getExtroversionLevel() != null ? request.getExtroversionLevel() : 0.6,
                request.getTeamName() != null ? request.getTeamName() : "Engineering Team",
                request.getTeamSize() != null ? request.getTeamSize() : 5,
                request.getTeamCulture() != null ? request.getTeamCulture() : "AGILE",
                request.getProjectType() != null ? request.getProjectType() : "GREENFIELD",
                membersInfo.toString()
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

    private TeamChemistryResponseDto parseChemistryResponse(String jsonResponse, TeamChemistryRequestDto req) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = root.path("content");
            if (contentArray.isArray() && !contentArray.isEmpty()) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode node = objectMapper.readTree(content);

                List<String> gapsFill = new ArrayList<>();
                node.path("teamGapsTheyFill").forEach(n -> gapsFill.add(n.asText()));
                List<String> overlaps = new ArrayList<>();
                node.path("potentialOverlaps").forEach(n -> overlaps.add(n.asText()));
                List<String> frictions = new ArrayList<>();
                node.path("potentialFrictions").forEach(n -> frictions.add(n.asText()));
                List<String> synergies = new ArrayList<>();
                node.path("synergyOpportunities").forEach(n -> synergies.add(n.asText()));
                List<String> tips = new ArrayList<>();
                node.path("onboardingTips").forEach(n -> tips.add(n.asText()));

                List<TeamChemistryResponseDto.InteractionPrediction> interactions = new ArrayList<>();
                node.path("interactions").forEach(i -> interactions.add(
                        TeamChemistryResponseDto.InteractionPrediction.builder()
                                .memberRole(i.path("memberRole").asText())
                                .compatibilityScore(i.path("compatibilityScore").asDouble())
                                .interactionType(i.path("interactionType").asText())
                                .advice(i.path("advice").asText())
                                .build()));

                Map<String, Double> personality = new HashMap<>();
                JsonNode pd = node.path("personalityDimensions");
                pd.fieldNames().forEachRemaining(f -> personality.put(f, pd.path(f).asDouble()));

                return TeamChemistryResponseDto.builder()
                        .chemistryScore(node.path("chemistryScore").asDouble(70))
                        .compatibilityLevel(node.path("compatibilityLevel").asText("GOOD"))
                        .cultureFitScore(node.path("cultureFitScore").asDouble(75))
                        .collaborationPotential(node.path("collaborationPotential").asDouble(72))
                        .predictedTeamRole(node.path("predictedTeamRole").asText("EXECUTOR"))
                        .roleGapFitScore(node.path("roleGapFitScore").asDouble(68))
                        .teamGapsTheyFill(gapsFill)
                        .potentialOverlaps(overlaps)
                        .interactions(interactions)
                        .potentialFrictions(frictions)
                        .synergyOpportunities(synergies)
                        .conflictRisk(node.path("conflictRisk").asDouble(25))
                        .teamProductivityImpact(node.path("teamProductivityImpact").asDouble(10))
                        .personalityDimensions(personality)
                        .summary(node.path("summary").asText(""))
                        .onboardingTips(tips)
                        .managementAdvice(node.path("managementAdvice").asText(""))
                        .teamDynamicsImpact(node.path("teamDynamicsImpact").asText(""))
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to parse team chemistry response: {}", e.getMessage());
        }
        return createMockChemistryAnalysis(req);
    }

    private TeamChemistryResponseDto createMockChemistryAnalysis(TeamChemistryRequestDto request) {
        List<TeamChemistryResponseDto.InteractionPrediction> interactions = new ArrayList<>();
        interactions.add(TeamChemistryResponseDto.InteractionPrediction.builder()
                .memberRole("Tech Lead")
                .compatibilityScore(85.0)
                .interactionType("COMPLEMENTARY")
                .advice("Natural mentor-mentee dynamic. Encourage pair programming sessions.")
                .build());
        interactions.add(TeamChemistryResponseDto.InteractionPrediction.builder()
                .memberRole("Senior Developer")
                .compatibilityScore(78.0)
                .interactionType("COMPLEMENTARY")
                .advice("Similar work styles — will collaborate well on complex features.")
                .build());
        interactions.add(TeamChemistryResponseDto.InteractionPrediction.builder()
                .memberRole("Frontend Developer")
                .compatibilityScore(65.0)
                .interactionType("NEUTRAL")
                .advice("Different communication styles — may need clear API contracts to avoid friction.")
                .build());
        interactions.add(TeamChemistryResponseDto.InteractionPrediction.builder()
                .memberRole("QA Engineer")
                .compatibilityScore(72.0)
                .interactionType("COMPLEMENTARY")
                .advice("Candidate's systematic approach will help improve test coverage discussions.")
                .build());

        Map<String, Double> personality = new LinkedHashMap<>();
        personality.put("openness", 0.72);
        personality.put("conscientiousness", 0.81);
        personality.put("extroversion", 0.58);
        personality.put("agreeableness", 0.69);
        personality.put("neuroticism", 0.31);

        return TeamChemistryResponseDto.builder()
                .chemistryScore(76.0)
                .compatibilityLevel("GOOD")
                .cultureFitScore(79.0)
                .collaborationPotential(74.0)
                .predictedTeamRole("EXECUTOR")
                .roleGapFitScore(82.0)
                .teamGapsTheyFill(Arrays.asList("Backend scalability expertise", "Code review discipline", "Documentation culture"))
                .potentialOverlaps(Arrays.asList("Backend feature development"))
                .interactions(interactions)
                .potentialFrictions(Arrays.asList(
                        "Communication style differences with frontend team",
                        "May prefer deeper focus time than current sprint cycle allows"))
                .synergyOpportunities(Arrays.asList(
                        "Strong technical foundation complements team lead's architectural vision",
                        "Documentation habit can elevate entire team's knowledge sharing",
                        "Systematic debugging approach will improve team's incident response"))
                .conflictRisk(22.0)
                .teamProductivityImpact(12.5)
                .personalityDimensions(personality)
                .summary("Candidate shows good compatibility with the existing team (76/100). Predicted role as EXECUTOR " +
                        "fills a key gap in the team's capacity for reliable feature delivery. Strong complementary " +
                        "dynamics predicted with Tech Lead and Senior Developer. Minor friction possible with Frontend " +
                        "Developer due to communication style differences — manageable with clear API contracts. " +
                        "Expected positive impact of +12.5% on team productivity within 3 months of onboarding.")
                .onboardingTips(Arrays.asList(
                        "Pair with Tech Lead during first week for architecture overview",
                        "Set up 1:1 with each team member in first 2 weeks",
                        "Start with a well-defined medium-complexity task to build confidence",
                        "Include in code review rotation from week 2"))
                .managementAdvice("Allow candidate dedicated focus time blocks (2-3 hours). " +
                        "Their systematic approach thrives with clear task boundaries. " +
                        "Schedule regular 1:1s to ensure integration and address any communication gaps early.")
                .teamDynamicsImpact("Adding this candidate is expected to strengthen the team's delivery capacity " +
                        "and bring more discipline to the code review process. The team will benefit from a new " +
                        "perspective on backend scalability. Monitor frontend-backend communication closely " +
                        "during the first month to catch any friction early.")
                .build();
    }
}
