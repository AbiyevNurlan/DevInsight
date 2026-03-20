package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.ScorecardDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Explainable AI Service
 * Provides transparent explanations for AI-driven scoring decisions
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ExplainableAIService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AuditTrailService auditTrailService;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    @Value("${anthropic.api-url:https://api.anthropic.com/v1/messages}")
    private String anthropicApiUrl;
    
    @Value("${anthropic.model:claude-3-5-sonnet-20241022}")
    private String modelVersion;
    
    /**
     * Generate comprehensive scorecard for a candidate
     */
    public ScorecardDto generateScorecard(
            Long candidateId, 
            String candidateName, 
            Long jobId, 
            String jobTitle,
            Map<String, Object> interviewData) {
        
        log.info("Generating explainable scorecard for candidate: {}", candidateId);
        
        try {
            // Build the scorecard using AI
            ScorecardDto scorecard = buildScorecardWithAI(
                candidateId, candidateName, jobId, jobTitle, interviewData);
            
            // Log to audit trail
            Map<String, Object> outputData = new HashMap<>();
            outputData.put("totalScore", scorecard.getTotalScore());
            outputData.put("scorePercentage", scorecard.getScorePercentage());
            outputData.put("performanceLevel", scorecard.getPerformanceLevel());
            
            auditTrailService.logDecision(
                candidateId,
                candidateName,
                "SCORECARD_GENERATED",
                "GENERATE_SCORECARD",
                interviewData,
                outputData,
                scorecard.getTotalScore(),
                scorecard.getRecommendation(),
                scorecard.getOverallExplanation(),
                "SYSTEM",
                "AI_SERVICE"
            );
            
            return scorecard;
            
        } catch (Exception e) {
            log.error("Failed to generate scorecard for candidate {}: {}", candidateId, e.getMessage(), e);
            // Return fallback scorecard
            return generateFallbackScorecard(candidateId, candidateName, jobId, jobTitle, interviewData);
        }
    }
    
    /**
     * Build scorecard using AI-powered analysis
     */
    private ScorecardDto buildScorecardWithAI(
            Long candidateId, 
            String candidateName, 
            Long jobId, 
            String jobTitle,
            Map<String, Object> interviewData) {
        
        // Check if API key is configured
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK scorecard data for testing");
            return createMockScorecard(candidateId, candidateName, jobId, jobTitle, interviewData);
        }
        
        // Prepare AI prompt for scorecard generation
        String prompt = buildScorecardPrompt(candidateName, jobTitle, interviewData);
        
        // Call Anthropic API
        Map<String, Object> aiResponse = callAnthropicAPI(prompt);
        
        // If API call fails, use mock data
        if (aiResponse.isEmpty()) {
            log.warn("Empty AI response - Using MOCK scorecard data");
            return createMockScorecard(candidateId, candidateName, jobId, jobTitle, interviewData);
        }
        
        // Parse AI response
        return parseScorecardFromAI(candidateId, candidateName, jobId, jobTitle, aiResponse);
    }
    
    /**
     * Build comprehensive prompt for AI scorecard generation
     */
    private String buildScorecardPrompt(String candidateName, String jobTitle, Map<String, Object> interviewData) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert HR analyst providing transparent, explainable scoring for candidate evaluation.\n\n");
        prompt.append("Candidate: ").append(candidateName).append("\n");
        prompt.append("Position: ").append(jobTitle).append("\n\n");
        
        prompt.append("Interview Data:\n");
        prompt.append(objectMapper.valueToTree(interviewData).toPrettyString()).append("\n\n");
        
        prompt.append("Generate a comprehensive, explainable scorecard with the following structure:\n\n");
        prompt.append("1. OVERALL SCORE (0-100)\n");
        prompt.append("2. CATEGORY BREAKDOWN:\n");
        prompt.append("   - Technical Skills (weight: 35%)\n");
        prompt.append("   - Problem Solving (weight: 25%)\n");
        prompt.append("   - Communication (weight: 20%)\n");
        prompt.append("   - Cultural Fit (weight: 10%)\n");
        prompt.append("   - Experience Relevance (weight: 10%)\n\n");
        prompt.append("3. REASON CODES: List 3-5 key factors that influenced the score\n");
        prompt.append("4. FEATURE CONTRIBUTIONS: Top 5 specific features and their impact\n");
        prompt.append("5. EXPLANATION: Clear, transparent explanation of the scoring\n");
        prompt.append("6. RECOMMENDATION: Hire/Consider/Reject with justification\n\n");
        prompt.append("Format your response as valid JSON with this structure:\n");
        prompt.append("{\n");
        prompt.append("  \"totalScore\": <number>,\n");
        prompt.append("  \"breakdown\": {\n");
        prompt.append("    \"Technical Skills\": {\"score\": <number>, \"maxScore\": 100, \"explanation\": \"...\", \"indicator\": \"STRONG|ADEQUATE|WEAK\"},\n");
        prompt.append("    ...\n");
        prompt.append("  },\n");
        prompt.append("  \"reasonCodes\": [\"REASON_1\", \"REASON_2\", ...],\n");
        prompt.append("  \"featureContributions\": [\n");
        prompt.append("    {\"name\": \"...\", \"value\": \"...\", \"contribution\": <number>, \"importance\": <0-1>, \"impact\": \"POSITIVE|NEGATIVE|NEUTRAL\", \"explanation\": \"...\"},\n");
        prompt.append("    ...\n");
        prompt.append("  ],\n");
        prompt.append("  \"explanation\": \"...\",\n");
        prompt.append("  \"recommendation\": \"...\",\n");
        prompt.append("  \"confidence\": <0-1>\n");
        prompt.append("}\n\n");
        prompt.append("Be specific, transparent, and ensure all scores are justified with clear explanations.");
        
        return prompt.toString();
    }
    
    /**
     * Call Anthropic API for scorecard generation
     */
    private Map<String, Object> callAnthropicAPI(String prompt) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured, using fallback");
            return Collections.emptyMap();
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", anthropicApiKey);
            headers.set("anthropic-version", "2023-06-01");
            headers.set("Content-Type", "application/json");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelVersion);
            requestBody.put("max_tokens", 4000);
            requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
            ));
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                anthropicApiUrl,
                HttpMethod.POST,
                request,
                String.class
            );
            
            JsonNode responseNode = objectMapper.readTree(response.getBody());
            JsonNode contentNode = responseNode.path("content").get(0).path("text");
            String aiText = contentNode.asText();
            
            // Extract JSON from AI response
            String jsonContent = extractJsonFromText(aiText);
            @SuppressWarnings("unchecked")
            Map<String, Object> result = objectMapper.readValue(jsonContent, Map.class);
            return result;
            
        } catch (Exception e) {
            log.error("Error calling Anthropic API: {}", e.getMessage(), e);
            return Collections.emptyMap();
        }
    }
    
    /**
     * Extract JSON from AI response text
     */
    private String extractJsonFromText(String text) {
        int start = text.indexOf("{");
        int end = text.lastIndexOf("}");
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return "{}";
    }
    
    /**
     * Parse scorecard from AI response
     */
    private ScorecardDto parseScorecardFromAI(
            Long candidateId,
            String candidateName,
            Long jobId,
            String jobTitle,
            Map<String, Object> aiResponse) {
        
        if (aiResponse.isEmpty()) {
            throw new RuntimeException("Empty AI response");
        }
        
        // Parse total score
        Double totalScore = ((Number) aiResponse.getOrDefault("totalScore", 0)).doubleValue();
        Double maxScore = 100.0;
        Double scorePercentage = (totalScore / maxScore) * 100;
        
        // Parse breakdown
        Map<String, ScorecardDto.CategoryScore> breakdown = new LinkedHashMap<>();
        @SuppressWarnings("unchecked")
        Map<String, Object> breakdownData = (Map<String, Object>) aiResponse.get("breakdown");
        
        if (breakdownData != null) {
            for (Map.Entry<String, Object> entry : breakdownData.entrySet()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> catData = (Map<String, Object>) entry.getValue();
                breakdown.put(entry.getKey(), ScorecardDto.CategoryScore.builder()
                    .categoryName(entry.getKey())
                    .score(((Number) catData.get("score")).doubleValue())
                    .maxScore(((Number) catData.getOrDefault("maxScore", 100)).doubleValue())
                    .explanation((String) catData.get("explanation"))
                    .performanceIndicator((String) catData.get("indicator"))
                    .build());
            }
        }
        
        // Parse reason codes
        @SuppressWarnings("unchecked")
        List<String> reasonCodes = (List<String>) aiResponse.getOrDefault("reasonCodes", new ArrayList<>());
        
        // Parse feature contributions
        List<ScorecardDto.FeatureContribution> contributions = new ArrayList<>();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> contribData = (List<Map<String, Object>>) aiResponse.get("featureContributions");
        
        if (contribData != null) {
            for (Map<String, Object> contrib : contribData) {
                contributions.add(ScorecardDto.FeatureContribution.builder()
                    .featureName((String) contrib.get("name"))
                    .featureValue((String) contrib.get("value"))
                    .contribution(((Number) contrib.getOrDefault("contribution", 0)).doubleValue())
                    .importance(((Number) contrib.getOrDefault("importance", 0.5)).doubleValue())
                    .impact((String) contrib.getOrDefault("impact", "NEUTRAL"))
                    .explanation((String) contrib.get("explanation"))
                    .build());
            }
        }
        
        return ScorecardDto.builder()
            .candidateId(candidateId)
            .candidateName(candidateName)
            .jobId(jobId)
            .jobTitle(jobTitle)
            .totalScore(totalScore)
            .maxScore(maxScore)
            .scorePercentage(scorePercentage)
            .performanceLevel(determinePerformanceLevel(scorePercentage))
            .breakdown(breakdown)
            .reasonCodes(reasonCodes)
            .featureContributions(contributions)
            .overallExplanation((String) aiResponse.getOrDefault("explanation", "No explanation provided"))
            .recommendation((String) aiResponse.getOrDefault("recommendation", "Further review required"))
            .confidenceLevel(((Number) aiResponse.getOrDefault("confidence", 0.7)).doubleValue())
            .generatedAt(LocalDateTime.now())
            .generatedBy("AI-ExplainableService")
            .modelVersion(modelVersion)
            .build();
    }
    
    /**
     * Generate fallback scorecard when AI is unavailable
     */
    private ScorecardDto generateFallbackScorecard(
            Long candidateId,
            String candidateName,
            Long jobId,
            String jobTitle,
            Map<String, Object> interviewData) {
        
        log.info("Generating fallback scorecard for candidate: {}", candidateId);
        
        // Calculate basic scores from interview data
        Double totalScore = calculateBasicScore(interviewData);
        Double maxScore = 100.0;
        Double scorePercentage = (totalScore / maxScore) * 100;
        
        // Create basic breakdown
        Map<String, ScorecardDto.CategoryScore> breakdown = new LinkedHashMap<>();
        breakdown.put("Technical Skills", ScorecardDto.CategoryScore.builder()
            .categoryName("Technical Skills")
            .score(totalScore * 0.35)
            .maxScore(100.0)
            .weight(0.35)
            .explanation("Basic technical assessment based on interview responses")
            .performanceIndicator(determineIndicator(totalScore * 0.35))
            .build());
        
        breakdown.put("Problem Solving", ScorecardDto.CategoryScore.builder()
            .categoryName("Problem Solving")
            .score(totalScore * 0.25)
            .maxScore(100.0)
            .weight(0.25)
            .explanation("Problem-solving ability demonstrated in interview")
            .performanceIndicator(determineIndicator(totalScore * 0.25))
            .build());
        
        breakdown.put("Communication", ScorecardDto.CategoryScore.builder()
            .categoryName("Communication")
            .score(totalScore * 0.20)
            .maxScore(100.0)
            .weight(0.20)
            .explanation("Communication clarity and effectiveness")
            .performanceIndicator(determineIndicator(totalScore * 0.20))
            .build());
        
        return ScorecardDto.builder()
            .candidateId(candidateId)
            .candidateName(candidateName)
            .jobId(jobId)
            .jobTitle(jobTitle)
            .totalScore(totalScore)
            .maxScore(maxScore)
            .scorePercentage(scorePercentage)
            .performanceLevel(determinePerformanceLevel(scorePercentage))
            .breakdown(breakdown)
            .reasonCodes(Arrays.asList("BASIC_ASSESSMENT", "AI_UNAVAILABLE"))
            .featureContributions(new ArrayList<>())
            .overallExplanation("Basic assessment completed. AI-powered detailed analysis unavailable.")
            .recommendation(generateBasicRecommendation(scorePercentage))
            .confidenceLevel(0.5)
            .generatedAt(LocalDateTime.now())
            .generatedBy("Fallback-Service")
            .modelVersion("fallback-1.0")
            .build();
    }
    
    /**
     * Calculate basic score from interview data
     */
    private Double calculateBasicScore(Map<String, Object> interviewData) {
        // Simple scoring logic when AI is unavailable
        if (interviewData.containsKey("totalScore")) {
            return ((Number) interviewData.get("totalScore")).doubleValue();
        }
        
        if (interviewData.containsKey("correctAnswers") && interviewData.containsKey("totalQuestions")) {
            int correct = ((Number) interviewData.get("correctAnswers")).intValue();
            int total = ((Number) interviewData.get("totalQuestions")).intValue();
            return (correct * 100.0) / total;
        }
        
        return 65.0; // Default moderate score
    }
    
    /**
     * Explain individual score components
     */
    public Map<String, Object> explainScore(Double score, Map<String, Object> context) {
        Map<String, Object> explanation = new HashMap<>();
        
        String performanceLevel = determinePerformanceLevel(score);
        explanation.put("score", score);
        explanation.put("performanceLevel", performanceLevel);
        explanation.put("percentile", calculatePercentile(score));
        explanation.put("interpretation", interpretScore(score));
        explanation.put("recommendations", getScoreRecommendations(score));
        
        return explanation;
    }
    
    /**
     * Get standardized reason codes
     */
    public List<Map<String, String>> getReasonCodes() {
        List<Map<String, String>> codes = new ArrayList<>();
        
        codes.add(Map.of(
            "code", "STRONG_TECHNICAL_SKILLS",
            "description", "Candidate demonstrated strong technical competency",
            "impact", "POSITIVE"
        ));
        
        codes.add(Map.of(
            "code", "EXCELLENT_PROBLEM_SOLVING",
            "description", "Superior analytical and problem-solving abilities",
            "impact", "POSITIVE"
        ));
        
        codes.add(Map.of(
            "code", "CLEAR_COMMUNICATION",
            "description", "Excellent communication and articulation skills",
            "impact", "POSITIVE"
        ));
        
        codes.add(Map.of(
            "code", "RELEVANT_EXPERIENCE",
            "description", "Strong relevant industry experience",
            "impact", "POSITIVE"
        ));
        
        codes.add(Map.of(
            "code", "CULTURAL_FIT",
            "description", "Good alignment with company culture and values",
            "impact", "POSITIVE"
        ));
        
        codes.add(Map.of(
            "code", "TECHNICAL_GAPS",
            "description", "Some gaps in required technical skills",
            "impact", "NEGATIVE"
        ));
        
        codes.add(Map.of(
            "code", "LIMITED_EXPERIENCE",
            "description", "Limited experience in key areas",
            "impact", "NEGATIVE"
        ));
        
        codes.add(Map.of(
            "code", "COMMUNICATION_CONCERNS",
            "description", "Areas for improvement in communication",
            "impact", "NEGATIVE"
        ));
        
        return codes;
    }
    
    // Helper methods
    
    private String determinePerformanceLevel(Double scorePercentage) {
        if (scorePercentage >= 90) return "EXCELLENT";
        if (scorePercentage >= 75) return "GOOD";
        if (scorePercentage >= 60) return "AVERAGE";
        if (scorePercentage >= 40) return "BELOW_AVERAGE";
        return "POOR";
    }
    
    private String determineIndicator(Double score) {
        if (score >= 70) return "STRONG";
        if (score >= 50) return "ADEQUATE";
        return "WEAK";
    }
    
    private String generateBasicRecommendation(Double scorePercentage) {
        if (scorePercentage >= 75) {
            return "RECOMMEND: Candidate shows strong potential";
        } else if (scorePercentage >= 60) {
            return "CONSIDER: Candidate has potential with some development areas";
        } else {
            return "REVIEW: Additional assessment recommended";
        }
    }
    
    private int calculatePercentile(Double score) {
        // Simplified percentile calculation
        if (score >= 90) return 95;
        if (score >= 80) return 85;
        if (score >= 70) return 70;
        if (score >= 60) return 50;
        if (score >= 50) return 30;
        return 15;
    }
    
    private String interpretScore(Double score) {
        if (score >= 90) return "Outstanding performance - Top tier candidate";
        if (score >= 80) return "Strong performance - Highly recommended";
        if (score >= 70) return "Good performance - Recommended with minor reservations";
        if (score >= 60) return "Satisfactory performance - Consider based on other factors";
        if (score >= 50) return "Below expectations - Significant concerns";
        return "Poor performance - Not recommended";
    }
    
    private List<String> getScoreRecommendations(Double score) {
        List<String> recommendations = new ArrayList<>();
        
        if (score >= 80) {
            recommendations.add("Proceed to final interview stage");
            recommendations.add("Consider for immediate hiring");
        } else if (score >= 60) {
            recommendations.add("Schedule follow-up interview");
            recommendations.add("Assess specific skill gaps");
            recommendations.add("Consider for roles with training opportunities");
        } else {
            recommendations.add("Provide detailed feedback");
            recommendations.add("Suggest areas for improvement");
            recommendations.add("Consider for future opportunities after upskilling");
        }
        
        return recommendations;
    }
    
    /**
     * Create realistic mock scorecard based on interview data
     */
    private ScorecardDto createMockScorecard(
            Long candidateId,
            String candidateName,
            Long jobId,
            String jobTitle,
            Map<String, Object> interviewData) {
        
        log.info("🎭 Generating MOCK scorecard for candidate: {}", candidateName);
        
        // Calculate scores based on interview data
        Double totalScore = calculateBasicScore(interviewData);
        Double maxScore = 100.0;
        Double scorePercentage = (totalScore / maxScore) * 100;
        
        // Create detailed breakdown
        Map<String, ScorecardDto.CategoryScore> breakdown = new LinkedHashMap<>();
        
        breakdown.put("Technical Skills", ScorecardDto.CategoryScore.builder()
            .categoryName("Technical Skills")
            .score(totalScore * 0.35)
            .maxScore(100.0)
            .weight(0.35)
            .explanation("Strong technical foundation with hands-on experience in required technologies. Demonstrates solid understanding of core concepts.")
            .performanceIndicator(totalScore >= 75 ? "STRONG" : totalScore >= 60 ? "ADEQUATE" : "WEAK")
            .build());
        
        breakdown.put("Problem Solving", ScorecardDto.CategoryScore.builder()
            .categoryName("Problem Solving")
            .score(totalScore * 0.25)
            .maxScore(100.0)
            .weight(0.25)
            .explanation("Good analytical approach with structured problem-solving methodology. Can break down complex problems effectively.")
            .performanceIndicator(totalScore >= 75 ? "STRONG" : totalScore >= 60 ? "ADEQUATE" : "WEAK")
            .build());
        
        breakdown.put("Communication", ScorecardDto.CategoryScore.builder()
            .categoryName("Communication")
            .score(totalScore * 0.20)
            .maxScore(100.0)
            .weight(0.20)
            .explanation("Clear and articulate communication style. Effectively conveys technical concepts and ideas.")
            .performanceIndicator(totalScore >= 75 ? "STRONG" : totalScore >= 60 ? "ADEQUATE" : "WEAK")
            .build());
        
        breakdown.put("Cultural Fit", ScorecardDto.CategoryScore.builder()
            .categoryName("Cultural Fit")
            .score(totalScore * 0.10)
            .maxScore(100.0)
            .weight(0.10)
            .explanation("Aligns well with company values and demonstrates collaborative mindset.")
            .performanceIndicator(totalScore >= 70 ? "STRONG" : "ADEQUATE")
            .build());
        
        breakdown.put("Experience Relevance", ScorecardDto.CategoryScore.builder()
            .categoryName("Experience Relevance")
            .score(totalScore * 0.10)
            .maxScore(100.0)
            .weight(0.10)
            .explanation("Relevant industry experience with transferable skills for the role.")
            .performanceIndicator(totalScore >= 70 ? "STRONG" : "ADEQUATE")
            .build());
        
        // Generate reason codes
        List<String> reasonCodes = new ArrayList<>();
        if (totalScore >= 80) {
            reasonCodes.add("STRONG_TECHNICAL_SKILLS");
            reasonCodes.add("EXCELLENT_PROBLEM_SOLVING");
            reasonCodes.add("CLEAR_COMMUNICATION");
            reasonCodes.add("RELEVANT_EXPERIENCE");
        } else if (totalScore >= 65) {
            reasonCodes.add("STRONG_TECHNICAL_SKILLS");
            reasonCodes.add("CLEAR_COMMUNICATION");
            reasonCodes.add("RELEVANT_EXPERIENCE");
        } else {
            reasonCodes.add("TECHNICAL_GAPS");
            reasonCodes.add("LIMITED_EXPERIENCE");
            reasonCodes.add("NEEDS_DEVELOPMENT");
        }
        
        // Generate feature contributions
        List<ScorecardDto.FeatureContribution> contributions = new ArrayList<>();
        
        contributions.add(ScorecardDto.FeatureContribution.builder()
            .featureName("Years of Experience")
            .featureValue(interviewData.getOrDefault("yearsExperience", "3-5 years").toString())
            .contribution(8.5)
            .importance(0.85)
            .impact("POSITIVE")
            .explanation("Solid experience level matching role requirements")
            .build());
        
        contributions.add(ScorecardDto.FeatureContribution.builder()
            .featureName("Technical Assessment Score")
            .featureValue(String.format("%.1f/100", totalScore))
            .contribution(totalScore >= 70 ? 9.0 : 6.0)
            .importance(0.90)
            .impact(totalScore >= 70 ? "POSITIVE" : "NEUTRAL")
            .explanation("Performance on technical questions and coding challenges")
            .build());
        
        contributions.add(ScorecardDto.FeatureContribution.builder()
            .featureName("Communication Quality")
            .featureValue("Clear and professional")
            .contribution(7.5)
            .importance(0.75)
            .impact("POSITIVE")
            .explanation("Demonstrates effective communication skills")
            .build());
        
        contributions.add(ScorecardDto.FeatureContribution.builder()
            .featureName("Problem-Solving Approach")
            .featureValue("Structured and methodical")
            .contribution(8.0)
            .importance(0.80)
            .impact("POSITIVE")
            .explanation("Shows systematic approach to complex problems")
            .build());
        
        contributions.add(ScorecardDto.FeatureContribution.builder()
            .featureName("Cultural Alignment")
            .featureValue("Good fit")
            .contribution(7.0)
            .importance(0.65)
            .impact("POSITIVE")
            .explanation("Values align with company culture")
            .build());
        
        // Generate overall explanation and recommendation
        String explanation = generateMockExplanation(totalScore, jobTitle);
        String recommendation = generateMockRecommendation(scorePercentage);
        
        log.info("✅ Generated MOCK scorecard: score={}, performance={}", totalScore, determinePerformanceLevel(scorePercentage));
        
        return ScorecardDto.builder()
            .candidateId(candidateId)
            .candidateName(candidateName)
            .jobId(jobId)
            .jobTitle(jobTitle)
            .totalScore(totalScore)
            .maxScore(maxScore)
            .scorePercentage(scorePercentage)
            .performanceLevel(determinePerformanceLevel(scorePercentage))
            .breakdown(breakdown)
            .reasonCodes(reasonCodes)
            .featureContributions(contributions)
            .overallExplanation(explanation)
            .recommendation(recommendation)
            .confidenceLevel(0.85)
            .generatedAt(LocalDateTime.now())
            .generatedBy("MOCK-ExplainableAI-Service")
            .modelVersion("mock-v1.0")
            .build();
    }
    
    private String generateMockExplanation(Double score, String jobTitle) {
        if (score >= 85) {
            return String.format("Exceptional candidate for the %s position. Demonstrates outstanding technical proficiency, " +
                "strong problem-solving capabilities, and excellent communication skills. " +
                "The candidate shows deep understanding of core concepts and practical application ability. " +
                "Their experience aligns perfectly with role requirements. Highly recommended for immediate consideration.", 
                jobTitle);
        } else if (score >= 70) {
            return String.format("Strong candidate for the %s role with solid technical foundation and good problem-solving skills. " +
                "Communication is clear and professional. Some minor areas for development, but overall demonstrates " +
                "the capabilities needed for success in this position. Recommended for progression to next interview stage.",
                jobTitle);
        } else if (score >= 55) {
            return String.format("Adequate candidate for the %s position with acceptable baseline skills. " +
                "Shows potential but has notable gaps in some areas. Would benefit from additional training and mentorship. " +
                "Consider for junior-level variations of the role or with structured development plan.",
                jobTitle);
        } else {
            return String.format("Candidate shows interest in the %s role but currently lacks some essential skills. " +
                "Significant development needed in technical areas. May be suitable for more junior positions " +
                "or could be reconsidered after gaining additional experience and training.",
                jobTitle);
        }
    }
    
    private String generateMockRecommendation(Double scorePercentage) {
        if (scorePercentage >= 85) {
            return "STRONG HIRE: Proceed with offer. Exceptional candidate who exceeds requirements.";
        } else if (scorePercentage >= 75) {
            return "RECOMMEND: Move to final interview round. Strong candidate worth pursuing.";
        } else if (scorePercentage >= 65) {
            return "CONSIDER: Proceed with caution. Acceptable candidate with some reservations.";
        } else if (scorePercentage >= 50) {
            return "MARGINAL: Additional assessment needed. Significant development areas identified.";
        } else {
            return "NOT RECOMMENDED: Does not meet minimum requirements at this time.";
        }
    }
}

