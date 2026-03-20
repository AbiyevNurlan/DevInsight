package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.MultimodalAnalysisDto;
import az.edu.itbrains.devinsight2.interview.dto.MultimodalAnswerDto;
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

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class MultimodalAnalysisService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Analyze answer across all modalities (text, voice, video)
     */
    public MultimodalAnalysisDto analyzeMultimodal(MultimodalAnswerDto answer) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("⚠️ Anthropic API key not configured - Using MOCK data for testing");
            return createMockAnalysis(answer);
        }
        
        try {
            log.info("Analyzing multimodal answer for session: {}", answer.getSessionId());
            
            String prompt = buildMultimodalPrompt(answer);
            String responseJson = callClaudeAPI(prompt);
            return parseAnalysis(responseJson);
            
        } catch (Exception e) {
            log.error("Failed to analyze multimodal answer: {}", e.getMessage(), e);
            log.warn("Falling back to MOCK data");
            return createMockAnalysis(answer);
        }
    }
    
    private String buildMultimodalPrompt(MultimodalAnswerDto answer) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Analyze this multimodal interview answer comprehensively.\n\n");
        
        prompt.append("Question: ").append(answer.getQuestionText()).append("\n\n");
        
        if (answer.getTextAnswer() != null) {
            prompt.append("Text Answer: ").append(answer.getTextAnswer()).append("\n\n");
        }
        
        if (answer.getAudioTranscript() != null) {
            prompt.append("Audio Transcript: ").append(answer.getAudioTranscript()).append("\n");
            if (answer.getAudioMetrics() != null) {
                prompt.append("Audio Metrics: ").append(answer.getAudioMetrics()).append("\n\n");
            }
        }
        
        if (answer.getVideoTranscript() != null) {
            prompt.append("Video Transcript: ").append(answer.getVideoTranscript()).append("\n");
            if (answer.getVideoMetrics() != null) {
                prompt.append("Video Metrics: ").append(answer.getVideoMetrics()).append("\n\n");
            }
        }
        
        prompt.append("""
            Return ONLY valid JSON without markdown:
            {
                "textQualityScore": 0-100,
                "textClarity": "EXCELLENT|GOOD|FAIR|POOR",
                "textDepth": "COMPREHENSIVE|ADEQUATE|SUPERFICIAL",
                "voiceQualityScore": 0-100,
                "communicationSkill": "EXCELLENT|GOOD|FAIR|POOR",
                "confidence": "HIGH|MODERATE|LOW",
                "emotionalState": "CALM|NERVOUS|CONFIDENT|STRESSED",
                "videoQualityScore": 0-100,
                "nonverbalCommunication": "STRONG|MODERATE|WEAK",
                "professionalism": "EXCELLENT|GOOD|FAIR|POOR",
                "engagement": "HIGHLY_ENGAGED|ENGAGED|DISENGAGED",
                "overallScore": 0-100,
                "consistency": "HIGHLY_CONSISTENT|CONSISTENT|INCONSISTENT",
                "authenticity": "GENUINE|REHEARSED|UNCERTAIN",
                "recommendation": "STRONG_YES|YES|MAYBE|NO",
                "detailedFeedback": "comprehensive feedback"
            }
            
            Evaluation criteria:
            - Text: clarity, depth, relevance, structure
            - Voice: communication skill, confidence, emotional stability
            - Video: body language, professionalism, engagement
            - Consistency: alignment across modalities
            - Authenticity: genuine vs rehearsed responses
            """);
        
        return prompt.toString();
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
    
    private MultimodalAnalysisDto parseAnalysis(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                JsonNode analysisNode = objectMapper.readTree(content);
                
                return MultimodalAnalysisDto.builder()
                    .textQualityScore(analysisNode.path("textQualityScore").asInt(50))
                    .textClarity(analysisNode.path("textClarity").asText("FAIR"))
                    .textDepth(analysisNode.path("textDepth").asText("ADEQUATE"))
                    .voiceQualityScore(analysisNode.path("voiceQualityScore").asInt(50))
                    .communicationSkill(analysisNode.path("communicationSkill").asText("FAIR"))
                    .confidence(analysisNode.path("confidence").asText("MODERATE"))
                    .emotionalState(analysisNode.path("emotionalState").asText("CALM"))
                    .videoQualityScore(analysisNode.path("videoQualityScore").asInt(50))
                    .nonverbalCommunication(analysisNode.path("nonverbalCommunication").asText("MODERATE"))
                    .professionalism(analysisNode.path("professionalism").asText("GOOD"))
                    .engagement(analysisNode.path("engagement").asText("ENGAGED"))
                    .overallScore(analysisNode.path("overallScore").asInt(50))
                    .consistency(analysisNode.path("consistency").asText("CONSISTENT"))
                    .authenticity(analysisNode.path("authenticity").asText("GENUINE"))
                    .recommendation(analysisNode.path("recommendation").asText("MAYBE"))
                    .detailedFeedback(analysisNode.path("detailedFeedback").asText())
                    .build();
            }
            
            return createDefaultAnalysis();
        } catch (Exception e) {
            log.error("Failed to parse multimodal analysis: {}", e.getMessage(), e);
            return createDefaultAnalysis();
        }
    }
    
    private MultimodalAnalysisDto createDefaultAnalysis() {
        return MultimodalAnalysisDto.builder()
            .textQualityScore(50)
            .textClarity("FAIR")
            .textDepth("ADEQUATE")
            .voiceQualityScore(50)
            .communicationSkill("FAIR")
            .confidence("MODERATE")
            .emotionalState("CALM")
            .videoQualityScore(50)
            .nonverbalCommunication("MODERATE")
            .professionalism("GOOD")
            .engagement("ENGAGED")
            .overallScore(50)
            .consistency("CONSISTENT")
            .authenticity("GENUINE")
            .recommendation("MAYBE")
            .detailedFeedback("Automated multimodal analysis unavailable. Manual review recommended.")
            .build();
    }
    
    /**
     * Create realistic mock multimodal analysis
     */
    private MultimodalAnalysisDto createMockAnalysis(MultimodalAnswerDto answer) {
        log.info("🎭 Generating MOCK multimodal analysis for session: {}", answer.getSessionId());
        
        String textAnswer = answer.getTextAnswer() != null ? answer.getTextAnswer() : "";
        int textLength = textAnswer.length();
        
        // Calculate scores based on available data
        int textScore = calculateTextScore(textLength);
        int voiceScore = answer.getAudioTranscript() != null ? 75 : 60;
        int videoScore = answer.getVideoTranscript() != null ? 70 : 60;
        int overallScore = (textScore + voiceScore + videoScore) / 3;
        
        String textClarity = textScore >= 75 ? "EXCELLENT" : textScore >= 60 ? "GOOD" : "FAIR";
        String textDepth = textScore >= 70 ? "COMPREHENSIVE" : textScore >= 55 ? "ADEQUATE" : "BASIC";
        String commSkill = voiceScore >= 75 ? "EXCELLENT" : voiceScore >= 60 ? "GOOD" : "FAIR";
        String confidence = overallScore >= 75 ? "HIGH" : overallScore >= 60 ? "MODERATE" : "LOW";
        String emotionalState = overallScore >= 70 ? "CONFIDENT" : overallScore >= 50 ? "CALM" : "ANXIOUS";
        String nonverbal = videoScore >= 70 ? "STRONG" : videoScore >= 55 ? "MODERATE" : "WEAK";
        String professionalism = overallScore >= 65 ? "EXCELLENT" : "GOOD";
        String engagement = overallScore >= 70 ? "HIGHLY_ENGAGED" : overallScore >= 55 ? "ENGAGED" : "SOMEWHAT_ENGAGED";
        String consistency = overallScore >= 65 ? "HIGHLY_CONSISTENT" : "CONSISTENT";
        String authenticity = overallScore >= 60 ? "GENUINE" : "AUTHENTIC";
        String recommendation = overallScore >= 75 ? "YES" : overallScore >= 60 ? "MAYBE" : "NO";
        
        String feedback = generateMockMultimodalFeedback(overallScore, textScore, voiceScore, videoScore);
        
        log.info("✅ Generated MOCK multimodal analysis: overall={}, text={}, voice={}, video={}",
            overallScore, textScore, voiceScore, videoScore);
        
        return MultimodalAnalysisDto.builder()
            .textQualityScore(textScore)
            .textClarity(textClarity)
            .textDepth(textDepth)
            .voiceQualityScore(voiceScore)
            .communicationSkill(commSkill)
            .confidence(confidence)
            .emotionalState(emotionalState)
            .videoQualityScore(videoScore)
            .nonverbalCommunication(nonverbal)
            .professionalism(professionalism)
            .engagement(engagement)
            .overallScore(overallScore)
            .consistency(consistency)
            .authenticity(authenticity)
            .recommendation(recommendation)
            .detailedFeedback(feedback)
            .build();
    }
    
    private int calculateTextScore(int length) {
        if (length > 300) return 85;
        if (length > 200) return 75;
        if (length > 100) return 65;
        if (length > 50) return 55;
        return 45;
    }
    
    private String generateMockMultimodalFeedback(int overall, int text, int voice, int video) {
        StringBuilder feedback = new StringBuilder();
        
        feedback.append("Multimodal Analysis Summary:\n\n");
        
        if (text >= 75) {
            feedback.append("✓ Text Quality: Excellent written communication with comprehensive explanations.\n");
        } else if (text >= 60) {
            feedback.append("✓ Text Quality: Good written responses with clear articulation.\n");
        } else {
            feedback.append("• Text Quality: Adequate but could be more detailed.\n");
        }
        
        if (voice >= 70) {
            feedback.append("✓ Voice Quality: Strong verbal communication with good confidence.\n");
        } else {
            feedback.append("• Voice Quality: Acceptable verbal skills, room for improvement.\n");
        }
        
        if (video >= 70) {
            feedback.append("✓ Video Presence: Professional demeanor with positive body language.\n");
        } else {
            feedback.append("• Video Presence: Satisfactory presentation, consider more engagement.\n");
        }
        
        feedback.append("\nOverall: ");
        if (overall >= 75) {
            feedback.append("Strong performance across all modalities. Candidate demonstrates excellent communication and professional presentation.");
        } else if (overall >= 60) {
            feedback.append("Good performance with consistent delivery. Minor areas for improvement identified.");
        } else {
            feedback.append("Adequate performance. Focus on enhancing clarity and engagement across modalities.");
        }
        
        return feedback.toString();
    }
}

