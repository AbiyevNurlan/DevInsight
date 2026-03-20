package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.TranscriptionRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.TranscriptionResponseDto;
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
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class TranscriptionService {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;
    
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
    private static final int MAX_TOKENS = 2048;
    
    /**
     * Transcribe audio/video to text
     * NOTE: This is a simulated transcription. In production, use services like:
     * - OpenAI Whisper API
     * - Google Cloud Speech-to-Text
     * - AWS Transcribe
     * - Azure Speech Services
     */
    public TranscriptionResponseDto transcribe(TranscriptionRequestDto request) {
        log.info("Transcription requested for audio: {}, video: {}", 
            request.getAudioUrl(), request.getVideoUrl());
        
        // In production, this would call actual transcription service
        // For now, returning simulated response
        return createSimulatedTranscription(request);
    }
    
    /**
     * Analyze audio metrics from transcription
     */
    public Map<String, Object> analyzeAudioMetrics(String audioUrl, String transcript) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured");
            return createDefaultAudioMetrics();
        }
        
        try {
            log.info("Analyzing audio metrics");
            
            String prompt = buildAudioAnalysisPrompt(transcript);
            String responseJson = callClaudeAPI(prompt);
            return parseAudioMetrics(responseJson);
            
        } catch (Exception e) {
            log.error("Failed to analyze audio metrics: {}", e.getMessage(), e);
            return createDefaultAudioMetrics();
        }
    }
    
    /**
     * Analyze video metrics
     */
    public Map<String, Object> analyzeVideoMetrics(String videoUrl, String transcript) {
        if (anthropicApiKey == null || anthropicApiKey.isEmpty()) {
            log.warn("Anthropic API key not configured");
            return createDefaultVideoMetrics();
        }
        
        try {
            log.info("Analyzing video metrics");
            
            String prompt = buildVideoAnalysisPrompt(transcript);
            String responseJson = callClaudeAPI(prompt);
            return parseVideoMetrics(responseJson);
            
        } catch (Exception e) {
            log.error("Failed to analyze video metrics: {}", e.getMessage(), e);
            return createDefaultVideoMetrics();
        }
    }
    
    private String buildAudioAnalysisPrompt(String transcript) {
        return """
            Analyze the following interview audio transcript for audio quality metrics.
            
            Transcript: %s
            
            Return ONLY valid JSON without markdown:
            {
                "tone": "CONFIDENT|NERVOUS|CALM|STRESSED",
                "speechRate": words per minute (number),
                "pauseCount": estimated number of pauses,
                "averagePauseDuration": average pause duration in seconds,
                "clearArticulation": true/false,
                "volumeLevel": 0-100
            }
            
            Infer from transcript:
            - Tone based on word choice and structure
            - Speech rate from word count (if timestamps available)
            - Pauses from ellipsis or sentence breaks
            - Articulation from grammar and completeness
            """.formatted(transcript);
    }
    
    private String buildVideoAnalysisPrompt(String transcript) {
        return """
            Analyze the following interview video transcript for non-verbal communication.
            
            Transcript: %s
            
            Return ONLY valid JSON without markdown:
            {
                "eyeContact": "GOOD|MODERATE|POOR",
                "facialExpression": "CONFIDENT|NERVOUS|NEUTRAL|ENGAGED",
                "bodyLanguage": "OPEN|CLOSED|FIDGETING|CALM",
                "gestureCount": estimated number,
                "professionalAppearance": true/false,
                "backgroundQuality": "PROFESSIONAL|ACCEPTABLE|DISTRACTING"
            }
            
            Note: This is inferred analysis from transcript only.
            In production, use computer vision for actual video analysis.
            """.formatted(transcript);
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
    
    private Map<String, Object> parseAudioMetrics(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                @SuppressWarnings("unchecked")
                Map<String, Object> result = objectMapper.readValue(content, Map.class);
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to parse audio metrics: {}", e.getMessage());
        }
        
        return createDefaultAudioMetrics();
    }
    
    private Map<String, Object> parseVideoMetrics(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode contentArray = rootNode.path("content");
            
            if (contentArray.isArray() && contentArray.size() > 0) {
                String content = contentArray.get(0).path("text").asText();
                @SuppressWarnings("unchecked")
                Map<String, Object> result = objectMapper.readValue(content, Map.class);
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to parse video metrics: {}", e.getMessage());
        }
        
        return createDefaultVideoMetrics();
    }
    
    private TranscriptionResponseDto createSimulatedTranscription(TranscriptionRequestDto request) {
        return TranscriptionResponseDto.builder()
            .transcript("Simulated transcription. In production, use Whisper API or similar service.")
            .language(request.getLanguage() != null ? request.getLanguage() : "en")
            .confidence(0.85)
            .duration(180)
            .segments(List.of(
                TranscriptionResponseDto.TimestampedSegment.builder()
                    .startTime(0)
                    .endTime(5000)
                    .text("Simulated transcript segment")
                    .speaker("Candidate")
                    .confidence(0.85)
                    .build()
            ))
            .build();
    }
    
    private Map<String, Object> createDefaultAudioMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("tone", "NEUTRAL");
        metrics.put("speechRate", 150.0);
        metrics.put("pauseCount", 5);
        metrics.put("averagePauseDuration", 1.5);
        metrics.put("clearArticulation", true);
        metrics.put("volumeLevel", 70);
        return metrics;
    }
    
    private Map<String, Object> createDefaultVideoMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("eyeContact", "MODERATE");
        metrics.put("facialExpression", "NEUTRAL");
        metrics.put("bodyLanguage", "CALM");
        metrics.put("gestureCount", 10);
        metrics.put("professionalAppearance", true);
        metrics.put("backgroundQuality", "ACCEPTABLE");
        return metrics;
    }
}
