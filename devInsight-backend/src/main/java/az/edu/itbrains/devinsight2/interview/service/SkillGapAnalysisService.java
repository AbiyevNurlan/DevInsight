package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.SkillGapAnalysisRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.SkillGapAnalysisResponseDto;
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
public class SkillGapAnalysisService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Analyze skill gaps between current and target role
     */
    public SkillGapAnalysisResponseDto analyzeSkillGaps(SkillGapAnalysisRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK data for testing");
            return createMockAnalysis(request);
        }
        
        try {
            log.info("Analyzing skill gaps for candidate {} targeting {}", 
                request.getCandidateId(), request.getTargetRole());
            
            String prompt = buildSkillGapPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseSkillGapAnalysis(responseJson, request);
            
        } catch (Exception e) {
            log.error("Failed to analyze skill gaps: {}", e.getMessage(), e);
            log.warn("Falling back to MOCK data");
            return createMockAnalysis(request);
        }
    }
    
    private String buildSkillGapPrompt(SkillGapAnalysisRequestDto request) {
        return """
            Analyze skill gaps for a candidate targeting a specific role.
            
            Target Role: %s
            Experience Level: %s
            Current Skills: %s
            Years of Experience: %d
            
            Return ONLY valid JSON without markdown:
            {
                "requiredSkills": ["skill1", "skill2", ...],
                "skillGaps": [
                    {
                        "skillName": "skill name",
                        "category": "TECHNICAL|SOFT_SKILL|TOOL|FRAMEWORK",
                        "priority": "CRITICAL|HIGH|MEDIUM|LOW",
                        "currentLevel": "NONE|BASIC|INTERMEDIATE|ADVANCED",
                        "requiredLevel": "BASIC|INTERMEDIATE|ADVANCED|EXPERT",
                        "estimatedLearningWeeks": number,
                        "difficulty": "EASY|MODERATE|HARD|VERY_HARD"
                    }
                ],
                "missingCriticalSkills": ["skill1", "skill2", ...],
                "partialSkills": ["skill1", "skill2", ...],
                "strongSkills": ["skill1", "skill2", ...],
                "overallReadiness": 0-100,
                "estimatedLearningMonths": number,
                "readinessLevel": "READY|NEARLY_READY|NEEDS_DEVELOPMENT|SIGNIFICANT_GAP"
            }
            
            Analyze:
            - Required skills for the target role at the specified experience level
            - Compare with current skills
            - Prioritize critical vs nice-to-have skills
            - Estimate learning time based on skill complexity
            - Calculate overall readiness percentage
            """.formatted(
                request.getTargetRole(),
                request.getExperienceLevel(),
                request.getCurrentSkills(),
                request.getYearsOfExperience()
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
    
    private SkillGapAnalysisResponseDto parseSkillGapAnalysis(
            String jsonResponse, SkillGapAnalysisRequestDto request) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode analysisNode = objectMapper.readTree(content);
                
                return SkillGapAnalysisResponseDto.builder()
                    .targetRole(request.getTargetRole())
                    .experienceLevel(request.getExperienceLevel())
                    .currentSkills(request.getCurrentSkills())
                    .currentSkillCount(request.getCurrentSkills().size())
                    .requiredSkills(parseStringList(analysisNode, "requiredSkills"))
                    .requiredSkillCount(analysisNode.path("requiredSkills").size())
                    .skillGaps(parseSkillGaps(analysisNode))
                    .missingCriticalSkills(parseStringList(analysisNode, "missingCriticalSkills"))
                    .partialSkills(parseStringList(analysisNode, "partialSkills"))
                    .strongSkills(parseStringList(analysisNode, "strongSkills"))
                    .overallReadiness(analysisNode.path("overallReadiness").asDouble(50.0))
                    .estimatedLearningMonths(analysisNode.path("estimatedLearningMonths").asInt(6))
                    .readinessLevel(analysisNode.path("readinessLevel").asText("NEEDS_DEVELOPMENT"))
                    .build();
            }
            
            return createDefaultAnalysis(request);
        } catch (Exception e) {
            log.error("Failed to parse skill gap analysis: {}", e.getMessage(), e);
            return createDefaultAnalysis(request);
        }
    }
    
    private List<String> parseStringList(JsonNode node, String fieldName) {
        List<String> list = new ArrayList<>();
        JsonNode arrayNode = node.path(fieldName);
        
        if (arrayNode.isArray()) {
            arrayNode.forEach(item -> list.add(item.asText()));
        }
        
        return list;
    }
    
    private List<SkillGapAnalysisResponseDto.SkillGap> parseSkillGaps(JsonNode node) {
        List<SkillGapAnalysisResponseDto.SkillGap> gaps = new ArrayList<>();
        JsonNode gapsNode = node.path("skillGaps");
        
        if (gapsNode.isArray()) {
            gapsNode.forEach(gapNode -> {
                gaps.add(SkillGapAnalysisResponseDto.SkillGap.builder()
                    .skillName(gapNode.path("skillName").asText())
                    .category(gapNode.path("category").asText())
                    .priority(gapNode.path("priority").asText())
                    .currentLevel(gapNode.path("currentLevel").asText())
                    .requiredLevel(gapNode.path("requiredLevel").asText())
                    .estimatedLearningWeeks(gapNode.path("estimatedLearningWeeks").asInt(4))
                    .difficulty(gapNode.path("difficulty").asText())
                    .build());
            });
        }
        
        return gaps;
    }
    
    private SkillGapAnalysisResponseDto createDefaultAnalysis(SkillGapAnalysisRequestDto request) {
        return SkillGapAnalysisResponseDto.builder()
            .targetRole(request.getTargetRole())
            .experienceLevel(request.getExperienceLevel())
            .currentSkills(request.getCurrentSkills())
            .currentSkillCount(request.getCurrentSkills().size())
            .requiredSkills(List.of("Skill analysis unavailable"))
            .requiredSkillCount(0)
            .skillGaps(new ArrayList<>())
            .missingCriticalSkills(new ArrayList<>())
            .partialSkills(new ArrayList<>())
            .strongSkills(request.getCurrentSkills())
            .overallReadiness(50.0)
            .estimatedLearningMonths(6)
            .readinessLevel("NEEDS_DEVELOPMENT")
            .build();
    }
    
    /**
     * Create realistic mock skill gap analysis
     */
    private SkillGapAnalysisResponseDto createMockAnalysis(SkillGapAnalysisRequestDto request) {
        log.info("🎭 Generating MOCK skill gap analysis for role: {}", request.getTargetRole());
        
        String targetRole = request.getTargetRole();
        List<String> currentSkills = request.getCurrentSkills();
        int yearsExp = request.getYearsOfExperience() != null ? request.getYearsOfExperience() : 3;
        
        // Generate required skills based on role
        List<String> requiredSkills = generateRequiredSkills(targetRole);
        
        // Identify gaps
        List<String> missingSkills = new ArrayList<>();
        List<String> partialSkills = new ArrayList<>();
        List<String> strongSkills = new ArrayList<>();
        
        for (String required : requiredSkills) {
            if (currentSkills.stream().anyMatch(s -> s.equalsIgnoreCase(required))) {
                strongSkills.add(required);
            } else if (currentSkills.stream().anyMatch(s -> required.toLowerCase().contains(s.toLowerCase()))) {
                partialSkills.add(required);
            } else {
                missingSkills.add(required);
            }
        }
        
        // Generate detailed skill gaps
        List<SkillGapAnalysisResponseDto.SkillGap> skillGaps = new ArrayList<>();
        
        for (String missing : missingSkills) {
            skillGaps.add(SkillGapAnalysisResponseDto.SkillGap.builder()
                .skillName(missing)
                .category(determineSkillCategory(missing))
                .priority(determineSkillPriority(missing, targetRole))
                .currentLevel("NONE")
                .requiredLevel(yearsExp >= 5 ? "ADVANCED" : "INTERMEDIATE")
                .estimatedLearningWeeks(calculateLearningWeeks(missing))
                .difficulty(determineSkillDifficulty(missing))
                .build());
        }
        
        for (String partial : partialSkills) {
            skillGaps.add(SkillGapAnalysisResponseDto.SkillGap.builder()
                .skillName(partial)
                .category(determineSkillCategory(partial))
                .priority("MEDIUM")
                .currentLevel("BASIC")
                .requiredLevel(yearsExp >= 5 ? "ADVANCED" : "INTERMEDIATE")
                .estimatedLearningWeeks(calculateLearningWeeks(partial) / 2)
                .difficulty("MODERATE")
                .build());
        }
        
        // Calculate readiness
        double readiness = calculateReadiness(strongSkills.size(), partialSkills.size(), missingSkills.size(), requiredSkills.size());
        String readinessLevel = determineReadinessLevel(readiness);
        int estimatedMonths = calculateEstimatedMonths(skillGaps);
        
        log.info("✅ Generated MOCK skill gap analysis: readiness={}%, gaps={}, strong={}",
            String.format("%.1f", readiness), skillGaps.size(), strongSkills.size());
        
        return SkillGapAnalysisResponseDto.builder()
            .targetRole(targetRole)
            .experienceLevel(request.getExperienceLevel())
            .currentSkills(currentSkills)
            .currentSkillCount(currentSkills.size())
            .requiredSkills(requiredSkills)
            .requiredSkillCount(requiredSkills.size())
            .skillGaps(skillGaps)
            .missingCriticalSkills(missingSkills)
            .partialSkills(partialSkills)
            .strongSkills(strongSkills)
            .overallReadiness(readiness)
            .estimatedLearningMonths(estimatedMonths)
            .readinessLevel(readinessLevel)
            .build();
    }
    
    private List<String> generateRequiredSkills(String role) {
        String lowerRole = role.toLowerCase();
        List<String> skills = new ArrayList<>();
        
        if (lowerRole.contains("java") || lowerRole.contains("backend")) {
            skills.addAll(List.of("Java", "Spring Boot", "REST APIs", "SQL", "Microservices", 
                "JUnit", "Git", "Docker", "AWS", "Design Patterns"));
        } else if (lowerRole.contains("frontend") || lowerRole.contains("react")) {
            skills.addAll(List.of("JavaScript", "React", "TypeScript", "HTML/CSS", "Redux", 
                "REST APIs", "Git", "Responsive Design", "Testing", "Webpack"));
        } else if (lowerRole.contains("fullstack") || lowerRole.contains("full stack")) {
            skills.addAll(List.of("JavaScript", "React", "Node.js", "SQL", "REST APIs", 
                "Git", "Docker", "AWS", "Testing", "Agile"));
        } else if (lowerRole.contains("devops")) {
            skills.addAll(List.of("Docker", "Kubernetes", "AWS", "CI/CD", "Linux", 
                "Git", "Terraform", "Monitoring", "Scripting", "Security"));
        } else {
            skills.addAll(List.of("Programming", "Problem Solving", "Communication", "Teamwork", 
                "Git", "Testing", "Debugging", "Documentation", "Agile", "Code Review"));
        }
        
        return skills;
    }
    
    private String determineSkillCategory(String skill) {
        if (skill.matches("(?i).*(java|python|javascript|react|spring|node).*")) return "TECHNICAL";
        if (skill.matches("(?i).*(docker|kubernetes|aws|cloud).*")) return "TOOL";
        if (skill.matches("(?i).*(communication|teamwork|leadership).*")) return "SOFT_SKILL";
        if (skill.matches("(?i).*(rest|api|microservice|design).*")) return "FRAMEWORK";
        return "TECHNICAL";
    }
    
    private String determineSkillPriority(String skill, String role) {
        String lowerSkill = skill.toLowerCase();
        String lowerRole = role.toLowerCase();
        
        if (lowerRole.contains(lowerSkill)) return "CRITICAL";
        if (lowerSkill.contains("java") || lowerSkill.contains("spring") || 
            lowerSkill.contains("react") || lowerSkill.contains("sql")) return "HIGH";
        if (lowerSkill.contains("git") || lowerSkill.contains("testing")) return "MEDIUM";
        return "LOW";
    }
    
    private int calculateLearningWeeks(String skill) {
        String lower = skill.toLowerCase();
        if (lower.contains("java") || lower.contains("spring") || lower.contains("react")) return 12;
        if (lower.contains("docker") || lower.contains("kubernetes")) return 8;
        if (lower.contains("sql") || lower.contains("git")) return 4;
        return 6;
    }
    
    private String determineSkillDifficulty(String skill) {
        String lower = skill.toLowerCase();
        if (lower.contains("kubernetes") || lower.contains("microservice")) return "VERY_HARD";
        if (lower.contains("spring") || lower.contains("react")) return "HARD";
        if (lower.contains("git") || lower.contains("sql")) return "MODERATE";
        return "EASY";
    }
    
    private double calculateReadiness(int strong, int partial, int missing, int total) {
        if (total == 0) return 0.0;
        return ((strong * 1.0 + partial * 0.5) / total) * 100;
    }
    
    private String determineReadinessLevel(double readiness) {
        if (readiness >= 80) return "READY";
        if (readiness >= 60) return "NEARLY_READY";
        if (readiness >= 40) return "NEEDS_DEVELOPMENT";
        return "SIGNIFICANT_GAPS";
    }
    
    private int calculateEstimatedMonths(List<SkillGapAnalysisResponseDto.SkillGap> gaps) {
        int totalWeeks = gaps.stream()
            .filter(g -> g.getPriority().equals("CRITICAL") || g.getPriority().equals("HIGH"))
            .mapToInt(SkillGapAnalysisResponseDto.SkillGap::getEstimatedLearningWeeks)
            .sum();
        return Math.max(1, (totalWeeks + 3) / 4);
    }
}

