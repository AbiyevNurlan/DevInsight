package az.edu.itbrains.devinsight2.service.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Service for AI-powered chat responses using Claude API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIChatService {
    
    private final WebClient.Builder webClientBuilder;
    
    @Value("${ai.anthropic.api-key}")
    private String anthropicApiKey;
    
    @Value("${ai.anthropic.api-url}")
    private String anthropicApiUrl;
    
    @Value("${ai.anthropic.model}")
    private String anthropicModel;
    
    @Value("${ai.anthropic.max-tokens}")
    private int maxTokens;
    
    private static final String SYSTEM_PROMPT = 
        "You are an HR assistant conducting a post-interview conversation with a successful candidate. " +
        "Ask follow-up questions about their work experience, availability, salary expectations, and teamwork skills. " +
        "Be professional, friendly, and conversational. Keep responses concise (2-3 sentences). " +
        "Guide the conversation through these topics: work experience, start date, salary expectations, teamwork experience.";
    
    private static final List<String> CONVERSATION_QUESTIONS = List.of(
        "Congratulations on passing the interview! I'd like to ask you a few questions to better understand your background. Where have you worked before?",
        "That sounds great! When would you be available to start working with us?",
        "Thanks for that information. What are your salary expectations for this position?",
        "I appreciate you sharing that. Can you tell me about your experience working in teams? How do you handle collaboration and conflicts?",
        "Thank you for taking the time to answer these questions. We'll review your responses and get back to you soon!"
    );
    
    /**
     * Generate initial greeting message
     */
    public String generateInitialGreeting() {
        return CONVERSATION_QUESTIONS.get(0);
    }
    
    /**
     * Generate AI response based on conversation context
     */
    public String generateResponse(String userMessage, int questionIndex) {
        try {
            log.info("Generating AI response for question index: {}", questionIndex);
            
            // If we have predefined questions, use them
            if (questionIndex < CONVERSATION_QUESTIONS.size() - 1) {
                return CONVERSATION_QUESTIONS.get(questionIndex + 1);
            }
            
            // For dynamic responses, use Claude API
            return generateDynamicResponse(userMessage);
            
        } catch (Exception e) {
            log.error("Error generating AI response: ", e);
            return "Thank you for your response. Is there anything else you'd like to share about your background?";
        }
    }
    
    /**
     * Generate dynamic response using Claude API
     */
    private String generateDynamicResponse(String userMessage) {
        try {
            Map<String, Object> requestBody = Map.of(
                "model", anthropicModel,
                "max_tokens", maxTokens,
                "system", SYSTEM_PROMPT,
                "messages", List.of(
                    Map.of("role", "user", "content", userMessage)
                )
            );
            
            ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<Map<String, Object>>() {};
            
            Mono<Map<String, Object>> response = webClientBuilder.build()
                .post()
                .uri(anthropicApiUrl)
                .header("Authorization", "Bearer " + anthropicApiKey)
                .header("Content-Type", "application/json")
                .header("anthropic-version", "2023-06-01")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(typeRef);
            
            Map<String, Object> result = response.block();
            
            if (result != null && result.containsKey("content")) {
                Object contentObj = result.get("content");
                if (contentObj instanceof List<?> contentList && !contentList.isEmpty()) {
                    Object firstContent = contentList.get(0);
                    if (firstContent instanceof Map<?, ?> contentMap && contentMap.containsKey("text")) {
                        Object textObj = contentMap.get("text");
                        if (textObj instanceof String textResponse) {
                            return textResponse;
                        }
                    }
                }
            }
            
            log.warn("Unexpected Claude API response format: {}", result);
            return "Thank you for your response. Could you tell me more about that?";
            
        } catch (Exception e) {
            log.error("Error calling Claude API: ", e);
            return "Thank you for sharing that with me. What else would you like me to know about your background?";
        }
    }
    
    /**
     * Determine if conversation should continue based on message count
     */
    public boolean shouldContinueConversation(int messageCount) {
        // Continue for up to 8 messages (4 questions + 4 answers)
        return messageCount < 8;
    }
    
    /**
     * Generate conversation completion message
     */
    public String generateCompletionMessage() {
        return "Thank you for taking the time to answer these questions. We'll review your responses and get back to you soon with next steps!";
    }
}