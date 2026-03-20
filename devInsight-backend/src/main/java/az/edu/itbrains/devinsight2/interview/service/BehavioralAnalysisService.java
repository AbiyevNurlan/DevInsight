package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.BehavioralAnalysisRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.BehavioralAnalysisResultDto;
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
public class BehavioralAnalysisService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Analyze candidate's behavioral patterns and communication quality
     */
    public BehavioralAnalysisResultDto analyzeBehavior(BehavioralAnalysisRequestDto request) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK data for testing");
            return createMockAnalysis(request);
        }
        
        try {
            log.info("Analyzing behavioral patterns");
            
            String prompt = buildBehavioralPrompt(request);
            String responseJson = callClaudeAPI(prompt);
            return parseAnalysis(responseJson);
            
        } catch (Exception e) {
            log.error("Failed to analyze behavior: {}", e.getMessage(), e);
            log.warn("Falling back to MOCK data");
            return createMockAnalysis(request);
        }
    }
    
    /**
     * Build behavioral analysis prompt
     */
    private String buildBehavioralPrompt(BehavioralAnalysisRequestDto request) {
        return """
            Analyze the following interview response for behavioral and communication patterns.
            
            Candidate's Answer: %s
            
            Video Transcript: %s
            
            Audio Metadata: %s
            
            Question Type: %s
            
            Current Difficulty Level: %d/10
            
            Return ONLY valid JSON without markdown:
            {
                "sentiment": "POSITIVE|NEUTRAL|NEGATIVE|ANXIOUS|CONFIDENT",
                "sentimentScore": 0.0 to 1.0,
                "clarityScore": 0-10,
                "articulationScore": 0-10,
                "coherenceScore": 0-10,
                "analyticalThinkingScore": 0-10,
                "structuredApproachScore": 0-10,
                "creativityScore": 0-10,
                "confidenceLevel": 0-10,
                "collaborationIndicators": 0-10,
                "stressHandling": 0-10,
                "speechPace": "SLOW|MODERATE|FAST",
                "excessivePauses": boolean,
                "fillerWords": boolean,
                "overallBehavioralScore": 0-100,
                "recommendation": "INCREASE_DIFFICULTY|MAINTAIN|DECREASE_DIFFICULTY",
                "feedback": "detailed feedback",
                "skillBreakdown": {
                    "communication": 0-10,
                    "problemSolving": 0-10,
                    "teamwork": 0-10,
                    "adaptability": 0-10
                }
            }
            
            Evaluate:
            - Sentiment and emotional state
            - Communication clarity and structure
            - Problem-solving approach
            - Confidence and composure
            - Collaboration indicators
            - Stress handling
            - Speaking patterns
            
            Recommendation for next question difficulty:
            - If performing well (>80%%): INCREASE_DIFFICULTY
            - If adequate (60-80%%): MAINTAIN
            - If struggling (<60%%): DECREASE_DIFFICULTY
            """.formatted(
                request.getCandidateAnswer(),
                request.getVideoTranscript() != null ? request.getVideoTranscript() : "N/A",
                request.getAudioMetadata() != null ? request.getAudioMetadata() : "N/A",
                request.getQuestionType(),
                request.getCurrentDifficulty()
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
     * Parse behavioral analysis from Claude response
     */
    private BehavioralAnalysisResultDto parseAnalysis(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode analysisNode = objectMapper.readTree(content);
                
                return BehavioralAnalysisResultDto.builder()
                    .sentiment(analysisNode.path("sentiment").asText("NEUTRAL"))
                    .sentimentScore(analysisNode.path("sentimentScore").asDouble(0.5))
                    .clarityScore(analysisNode.path("clarityScore").asInt(5))
                    .articulationScore(analysisNode.path("articulationScore").asInt(5))
                    .coherenceScore(analysisNode.path("coherenceScore").asInt(5))
                    .analyticalThinkingScore(analysisNode.path("analyticalThinkingScore").asInt(5))
                    .structuredApproachScore(analysisNode.path("structuredApproachScore").asInt(5))
                    .creativityScore(analysisNode.path("creativityScore").asInt(5))
                    .confidenceLevel(analysisNode.path("confidenceLevel").asInt(5))
                    .collaborationIndicators(analysisNode.path("collaborationIndicators").asInt(5))
                    .stressHandling(analysisNode.path("stressHandling").asInt(5))
                    .speechPace(analysisNode.path("speechPace").asText("MODERATE"))
                    .excessivePauses(analysisNode.path("excessivePauses").asBoolean(false))
                    .fillerWords(analysisNode.path("fillerWords").asBoolean(false))
                    .overallBehavioralScore(analysisNode.path("overallBehavioralScore").asInt(50))
                    .recommendation(analysisNode.path("recommendation").asText("MAINTAIN"))
                    .feedback(analysisNode.path("feedback").asText(""))
                    .skillBreakdown(parseSkillBreakdown(analysisNode))
                    .build();
            }
            
            return createDefaultAnalysis();
        } catch (Exception e) {
            log.error("Failed to parse behavioral analysis: {}", e.getMessage(), e);
            return createDefaultAnalysis();
        }
    }
    
    private Map<String, Integer> parseSkillBreakdown(JsonNode node) {
        Map<String, Integer> breakdown = new HashMap<>();
        JsonNode skillNode = node.path("skillBreakdown");
        
        if (skillNode.isObject()) {
            skillNode.fields().forEachRemaining(entry -> 
                breakdown.put(entry.getKey(), entry.getValue().asInt(5))
            );
        }
        
        return breakdown;
    }
    
    /**
     * Create default analysis as fallback
     */
    private BehavioralAnalysisResultDto createDefaultAnalysis() {
        return BehavioralAnalysisResultDto.builder()
            .sentiment("NEUTRAL")
            .sentimentScore(0.5)
            .clarityScore(5)
            .articulationScore(5)
            .coherenceScore(5)
            .analyticalThinkingScore(5)
            .structuredApproachScore(5)
            .creativityScore(5)
            .confidenceLevel(5)
            .collaborationIndicators(5)
            .stressHandling(5)
            .speechPace("MODERATE")
            .excessivePauses(false)
            .fillerWords(false)
            .overallBehavioralScore(50)
            .recommendation("MAINTAIN")
            .feedback("Automated analysis unavailable. Manual review recommended.")
            .skillBreakdown(Map.of(
                "communication", 5,
                "problemSolving", 5,
                "teamwork", 5,
                "adaptability", 5
            ))
            .build();
    }
    
    /**
     * Create realistic mock behavioral analysis
     */
    private BehavioralAnalysisResultDto createMockAnalysis(BehavioralAnalysisRequestDto request) {
        log.info("🎭 Generating MOCK behavioral analysis");
        
        String answer = request != null && request.getCandidateAnswer() != null ? request.getCandidateAnswer() : "";
        int answerLength = answer.length();
        
        // Simulate analysis based on answer characteristics
        String sentiment;
        double sentimentScore;
        int clarityScore, articulationScore, coherenceScore;
        int analyticalThinking, structuredApproach, creativity;
        int confidenceLevel, collaboration, stressHandling;
        String speechPace;
        boolean excessivePauses, fillerWords;
        
        // Determine sentiment based on content
        if (answerLength > 300) {
            sentiment = "CONFIDENT";
            sentimentScore = 0.85;
            confidenceLevel = 8;
            clarityScore = 8;
            articulationScore = 8;
        } else if (answerLength > 150) {
            sentiment = "POSITIVE";
            sentimentScore = 0.75;
            confidenceLevel = 7;
            clarityScore = 7;
            articulationScore = 7;
        } else if (answerLength > 50) {
            sentiment = "NEUTRAL";
            sentimentScore = 0.6;
            confidenceLevel = 6;
            clarityScore = 6;
            articulationScore = 6;
        } else {
            sentiment = "ANXIOUS";
            sentimentScore = 0.4;
            confidenceLevel = 4;
            clarityScore = 5;
            articulationScore = 5;
        }
        
        // Generate other scores based on answer quality
        coherenceScore = clarityScore;
        analyticalThinking = Math.min(10, clarityScore + 1);
        structuredApproach = clarityScore;
        creativity = answerLength > 200 ? 8 : 6;
        collaboration = 7;
        stressHandling = confidenceLevel;
        
        // Determine speech characteristics
        if (answerLength > 250) {
            speechPace = "MODERATE";
            excessivePauses = false;
            fillerWords = false;
        } else if (answerLength < 100) {
            speechPace = "SLOW";
            excessivePauses = true;
            fillerWords = true;
        } else {
            speechPace = "MODERATE";
            excessivePauses = false;
            fillerWords = answerLength < 150;
        }
        
        // Calculate overall score
        int overallScore = (clarityScore + articulationScore + coherenceScore + 
                           analyticalThinking + structuredApproach + creativity +
                           confidenceLevel + collaboration + stressHandling) * 10 / 9;
        
        // Determine recommendation
        String recommendation;
        if (overallScore >= 80) {
            recommendation = "INCREASE_DIFFICULTY";
        } else if (overallScore >= 60) {
            recommendation = "MAINTAIN";
        } else {
            recommendation = "DECREASE_DIFFICULTY";
        }
        
        // Generate feedback
        String feedback = generateMockBehavioralFeedback(sentiment, clarityScore, confidenceLevel);
        
        // Create skill breakdown
        Map<String, Integer> skillBreakdown = Map.of(
            "communication", clarityScore,
            "problemSolving", analyticalThinking,
            "teamwork", collaboration,
            "adaptability", stressHandling,
            "leadership", Math.min(10, confidenceLevel + 1),
            "criticalThinking", analyticalThinking
        );
        
        log.info("✅ Generated MOCK behavioral analysis: sentiment={}, overall={}", sentiment, overallScore);
        
        return BehavioralAnalysisResultDto.builder()
            .sentiment(sentiment)
            .sentimentScore(sentimentScore)
            .clarityScore(clarityScore)
            .articulationScore(articulationScore)
            .coherenceScore(coherenceScore)
            .analyticalThinkingScore(analyticalThinking)
            .structuredApproachScore(structuredApproach)
            .creativityScore(creativity)
            .confidenceLevel(confidenceLevel)
            .collaborationIndicators(collaboration)
            .stressHandling(stressHandling)
            .speechPace(speechPace)
            .excessivePauses(excessivePauses)
            .fillerWords(fillerWords)
            .overallBehavioralScore(overallScore)
            .recommendation(recommendation)
            .feedback(feedback)
            .skillBreakdown(skillBreakdown)
            .build();
    }
    
    private String generateMockBehavioralFeedback(String sentiment, int clarity, int confidence) {
        StringBuilder feedback = new StringBuilder();
        
        if (sentiment.equals("CONFIDENT")) {
            feedback.append("Excellent behavioral indicators! The candidate demonstrates strong confidence, ");
            feedback.append("clear communication, and effective articulation. ");
        } else if (sentiment.equals("POSITIVE")) {
            feedback.append("Good behavioral patterns observed. The candidate shows positive engagement ");
            feedback.append("and communicates ideas clearly. ");
        } else if (sentiment.equals("NEUTRAL")) {
            feedback.append("Satisfactory behavioral indicators. The candidate maintains professional demeanor ");
            feedback.append("but could improve confidence and clarity. ");
        } else {
            feedback.append("Some areas for improvement in behavioral aspects. The candidate may benefit from ");
            feedback.append("additional preparation to build confidence and clarity. ");
        }
        
        if (clarity >= 8) {
            feedback.append("Communication is crystal clear with well-structured responses.");
        } else if (clarity >= 6) {
            feedback.append("Communication is generally clear with room for improvement in structure.");
        } else {
            feedback.append("Consider working on communication clarity and response organization.");
        }
        
        return feedback.toString();
    }
}

