package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.LearningPathRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.LearningPathResponseDto;
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
public class LearningPathService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Generate personalized learning path
     */
    public LearningPathResponseDto generateLearningPath(LearningPathRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured");
            return createDefaultLearningPath(request);
        }
        
        try {
            log.info("Generating learning path for candidate {} targeting {}", 
                request.getCandidateId(), request.getTargetRole());
            
            String prompt = buildLearningPathPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseLearningPath(responseJson, request);
            
        } catch (Exception e) {
            log.error("Failed to generate learning path: {}", e.getMessage(), e);
            return createDefaultLearningPath(request);
        }
    }
    
    private String buildLearningPathPrompt(LearningPathRequestDto request) {
        return """
            Create a personalized learning path for career development.
            
            Target Role: %s
            Skill Gaps: %s
            Learning Style: %s
            Available Hours Per Week: %d
            Budget: %s
            
            Return ONLY valid JSON without markdown:
            {
                "totalDurationWeeks": number,
                "difficultyLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
                "phases": [
                    {
                        "phaseNumber": 1,
                        "phaseName": "phase name",
                        "description": "what to learn",
                        "durationWeeks": number,
                        "skillsToCover": ["skill1", "skill2"],
                        "objectives": ["objective1", "objective2"],
                        "outcome": "expected outcome"
                    }
                ],
                "recommendedCourses": [
                    {
                        "courseName": "course name",
                        "platform": "Udemy|Coursera|edX|YouTube|etc",
                        "url": "course url or search term",
                        "skillCovered": "skill name",
                        "durationHours": number,
                        "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
                        "cost": "FREE|PAID|SUBSCRIPTION",
                        "rating": 0-5,
                        "description": "brief description"
                    }
                ],
                "milestones": ["milestone1", "milestone2", ...],
                "practiceProjects": ["project1", "project2", ...]
            }
            
            Create:
            - Structured learning phases (beginner → advanced)
            - Specific course recommendations matching learning style
            - Realistic time estimates based on available hours
            - Budget-appropriate resources
            - Practical projects for hands-on learning
            - Clear milestones for tracking progress
            """.formatted(
                request.getTargetRole(),
                request.getSkillGaps(),
                request.getLearningStyle(),
                request.getAvailableHoursPerWeek(),
                request.getBudget()
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
    
    private LearningPathResponseDto parseLearningPath(
            String jsonResponse, LearningPathRequestDto request) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode pathNode = objectMapper.readTree(content);
                
                return LearningPathResponseDto.builder()
                    .targetRole(request.getTargetRole())
                    .totalDurationWeeks(pathNode.path("totalDurationWeeks").asInt(12))
                    .difficultyLevel(pathNode.path("difficultyLevel").asText("INTERMEDIATE"))
                    .phases(parsePhases(pathNode))
                    .recommendedCourses(parseCourses(pathNode))
                    .milestones(parseStringList(pathNode, "milestones"))
                    .practiceProjects(parseStringList(pathNode, "practiceProjects"))
                    .build();
            }
            
            return createDefaultLearningPath(request);
        } catch (Exception e) {
            log.error("Failed to parse learning path: {}", e.getMessage(), e);
            return createDefaultLearningPath(request);
        }
    }
    
    private List<LearningPathResponseDto.LearningPhase> parsePhases(JsonNode node) {
        List<LearningPathResponseDto.LearningPhase> phases = new ArrayList<>();
        JsonNode phasesNode = node.path("phases");
        
        if (phasesNode.isArray()) {
            phasesNode.forEach(phaseNode -> {
                phases.add(LearningPathResponseDto.LearningPhase.builder()
                    .phaseNumber(phaseNode.path("phaseNumber").asInt())
                    .phaseName(phaseNode.path("phaseName").asText())
                    .description(phaseNode.path("description").asText())
                    .durationWeeks(phaseNode.path("durationWeeks").asInt())
                    .skillsToCover(parseStringList(phaseNode, "skillsToCover"))
                    .objectives(parseStringList(phaseNode, "objectives"))
                    .outcome(phaseNode.path("outcome").asText())
                    .build());
            });
        }
        
        return phases;
    }
    
    private List<LearningPathResponseDto.CourseRecommendation> parseCourses(JsonNode node) {
        List<LearningPathResponseDto.CourseRecommendation> courses = new ArrayList<>();
        JsonNode coursesNode = node.path("recommendedCourses");
        
        if (coursesNode.isArray()) {
            coursesNode.forEach(courseNode -> {
                courses.add(LearningPathResponseDto.CourseRecommendation.builder()
                    .courseName(courseNode.path("courseName").asText())
                    .platform(courseNode.path("platform").asText())
                    .url(courseNode.path("url").asText())
                    .skillCovered(courseNode.path("skillCovered").asText())
                    .durationHours(courseNode.path("durationHours").asInt())
                    .difficulty(courseNode.path("difficulty").asText())
                    .cost(courseNode.path("cost").asText())
                    .rating(courseNode.path("rating").asDouble())
                    .description(courseNode.path("description").asText())
                    .build());
            });
        }
        
        return courses;
    }
    
    private List<String> parseStringList(JsonNode node, String fieldName) {
        List<String> list = new ArrayList<>();
        JsonNode arrayNode = node.path(fieldName);
        
        if (arrayNode.isArray()) {
            arrayNode.forEach(item -> list.add(item.asText()));
        }
        
        return list;
    }
    
    private LearningPathResponseDto createDefaultLearningPath(LearningPathRequestDto request) {
        return LearningPathResponseDto.builder()
            .targetRole(request.getTargetRole())
            .totalDurationWeeks(12)
            .difficultyLevel("INTERMEDIATE")
            .phases(List.of(
                LearningPathResponseDto.LearningPhase.builder()
                    .phaseNumber(1)
                    .phaseName("Foundation Phase")
                    .description("Build fundamental skills")
                    .durationWeeks(4)
                    .skillsToCover(request.getSkillGaps())
                    .objectives(List.of("Master basics", "Complete introductory projects"))
                    .outcome("Solid foundation in key skills")
                    .build()
            ))
            .recommendedCourses(new ArrayList<>())
            .milestones(List.of("Complete Phase 1", "Build first project"))
            .practiceProjects(List.of("Hands-on project related to " + request.getTargetRole()))
            .build();
    }
}
