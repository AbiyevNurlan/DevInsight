package az.edu.itbrains.devinsight2.service.chat;

import az.edu.itbrains.devinsight2.dto.chat.*;
import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.chat.*;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.chat.ChatConversationRepository;
import az.edu.itbrains.devinsight2.repository.chat.ChatMessageRepository;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatService {
    
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final InterviewRepository interviewRepository;
    private final UserService userService;
    private final AIChatService aiChatService;
    
    private static final double MIN_PASSING_SCORE = 70.0;
    
    /**
     * Start a new chat conversation after successful interview
     */
    public ChatConversationDto startConversation(Long interviewId, Double interviewScore) {
        log.info("Starting chat conversation for interview: {}, score: {}", interviewId, interviewScore);
        
        User currentUser;
        try {
            currentUser = userService.getCurrentUser();
            log.info("Current user: {} with role: {}", currentUser.getEmail(), currentUser.getRole());
        } catch (Exception e) {
            log.error("Failed to get current user: ", e);
            throw new IllegalArgumentException("User authentication failed");
        }
        
        // Validate minimum score requirement
        if (interviewScore < MIN_PASSING_SCORE) {
            log.warn("User {} attempted to start chat with insufficient score: {}", currentUser.getEmail(), interviewScore);
            throw new IllegalArgumentException("Interview score must be at least " + MIN_PASSING_SCORE + "% to start chat");
        }
        
        // Get interview
        Interview interview;
        try {
            interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));
            log.info("Found interview: {} - {}", interview.getId(), interview.getTitle());
        } catch (Exception e) {
            log.error("Failed to find interview with ID {}: ", interviewId, e);
            throw new ResourceNotFoundException("Interview not found with id: " + interviewId);
        }
        
        // Check if conversation already exists
        try {
            boolean exists = conversationRepository.existsByCandidateAndInterview(currentUser.getId(), interviewId);
            if (exists) {
                log.warn("User {} attempted to create duplicate conversation for interview {}", currentUser.getEmail(), interviewId);
                throw new IllegalStateException("Chat conversation already exists for this interview");
            }
        } catch (Exception e) {
            log.error("Error checking existing conversations: ", e);
            throw new RuntimeException("Failed to check existing conversations");
        }
        
        // Create new conversation
        ChatConversation conversation;
        try {
            conversation = ChatConversation.builder()
                .candidate(currentUser)
                .interview(interview)
                .status(ChatStatus.ACTIVE)
                .interviewScore(interviewScore)
                .startedAt(LocalDateTime.now())
                .build();
            
            conversation = conversationRepository.save(conversation);
            log.info("Created chat conversation with ID: {}", conversation.getId());
        } catch (Exception e) {
            log.error("Failed to create conversation: ", e);
            throw new RuntimeException("Failed to create chat conversation");
        }
        
        // Send initial AI greeting
        try {
            String aiGreeting = aiChatService.generateInitialGreeting();
            ChatMessage aiMessage = ChatMessage.builder()
                .conversation(conversation)
                .content(aiGreeting)
                .type(MessageType.AI_SYSTEM)
                .timestamp(LocalDateTime.now())
                .build();
            
            messageRepository.save(aiMessage);
            log.info("Saved initial AI greeting message");
        } catch (Exception e) {
            log.error("Failed to save initial AI message: ", e);
            throw new RuntimeException("Failed to initialize chat conversation");
        }
        
        log.info("Successfully started chat conversation with ID: {}", conversation.getId());
        return convertToDto(conversation);
    }
    
    /**
     * Send a message in the chat conversation
     */
    public ChatMessageDto sendMessage(Long conversationId, String content) {
        log.info("Sending message to conversation: {}", conversationId);
        
        User currentUser = userService.getCurrentUser();
        
        // Get conversation
        ChatConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Chat conversation not found with id: " + conversationId));
        
        // Validate user owns this conversation
        if (!conversation.getCandidate().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("User is not authorized to access this conversation");
        }
        
        // Check if conversation is still active
        if (conversation.getStatus() != ChatStatus.ACTIVE) {
            throw new IllegalStateException("Cannot send message to " + conversation.getStatus().name().toLowerCase() + " conversation");
        }
        
        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
            .conversation(conversation)
            .content(content)
            .type(MessageType.USER)
            .timestamp(LocalDateTime.now())
            .build();
        
        userMessage = messageRepository.save(userMessage);
        
        // Generate AI response
        long messageCount = messageRepository.countByConversationId(conversationId);
        int questionIndex = (int) (messageCount / 2); // Every 2 messages is one Q&A pair
        
        String aiResponse;
        if (aiChatService.shouldContinueConversation((int) messageCount)) {
            aiResponse = aiChatService.generateResponse(content, questionIndex);
        } else {
            // End conversation
            aiResponse = aiChatService.generateCompletionMessage();
            conversation.setStatus(ChatStatus.COMPLETED);
            conversation.setCompletedAt(LocalDateTime.now());
            conversationRepository.save(conversation);
        }
        
        // Save AI response
        ChatMessage aiMessage = ChatMessage.builder()
            .conversation(conversation)
            .content(aiResponse)
            .type(MessageType.AI_SYSTEM)
            .timestamp(LocalDateTime.now())
            .build();
        
        messageRepository.save(aiMessage);
        
        log.info("Sent message and received AI response for conversation: {}", conversationId);
        return convertToMessageDto(userMessage);
    }
    
    /**
     * Get chat history for a conversation
     */
    @Transactional(readOnly = true)
    public ChatConversationDto getChatHistory(Long conversationId) {
        log.info("Getting chat history for conversation: {}", conversationId);
        
        User currentUser = userService.getCurrentUser();
        
        ChatConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Chat conversation not found with id: " + conversationId));
        
        // Validate user owns this conversation (candidates) or can view it (HR from same company)
        if (!conversation.getCandidate().getId().equals(currentUser.getId()) && 
            !canUserViewConversation(currentUser, conversation)) {
            throw new IllegalArgumentException("User is not authorized to access this conversation");
        }
        
        return convertToDto(conversation);
    }
    
    /**
     * Get all conversations for current user
     */
    @Transactional(readOnly = true)
    public List<ChatConversationDto> getUserConversations() {
        User currentUser = userService.getCurrentUser();
        
        List<ChatConversation> conversations = conversationRepository
            .findByCandidateIdOrderByCreatedAtDesc(currentUser.getId());
        
        return conversations.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Complete a conversation (candidate can manually end it)
     */
    public void completeConversation(Long conversationId) {
        log.info("Completing conversation: {}", conversationId);
        
        User currentUser = userService.getCurrentUser();
        
        ChatConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Chat conversation not found with id: " + conversationId));
        
        if (!conversation.getCandidate().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("User is not authorized to complete this conversation");
        }
        
        if (conversation.getStatus() == ChatStatus.ACTIVE) {
            conversation.setStatus(ChatStatus.COMPLETED);
            conversation.setCompletedAt(LocalDateTime.now());
            conversationRepository.save(conversation);
            
            log.info("Completed conversation: {}", conversationId);
        }
    }
    
    /**
     * Check if user can view conversation (HR from same company)
     */
    private boolean canUserViewConversation(User user, ChatConversation conversation) {
        return user.getRole().name().equals("HR") && 
               user.getCompany() != null && 
               user.getCompany().equals(conversation.getInterview().getCompany());
    }
    
    /**
     * Convert ChatConversation entity to DTO
     */
    private ChatConversationDto convertToDto(ChatConversation conversation) {
        List<ChatMessage> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversation.getId());
        
        return ChatConversationDto.builder()
            .id(conversation.getId())
            .candidateId(conversation.getCandidate().getId())
            .candidateName(conversation.getCandidate().getFullName())
            .interviewId(conversation.getInterview().getId())
            .interviewTitle(conversation.getInterview().getTitle())
            .status(conversation.getStatus())
            .interviewScore(conversation.getInterviewScore())
            .startedAt(conversation.getStartedAt())
            .completedAt(conversation.getCompletedAt())
            .messageCount(messages.size())
            .messages(messages.stream()
                .map(this::convertToMessageDto)
                .collect(Collectors.toList()))
            .build();
    }
    
    /**
     * Convert ChatMessage entity to DTO
     */
    private ChatMessageDto convertToMessageDto(ChatMessage message) {
        return ChatMessageDto.builder()
            .id(message.getId())
            .content(message.getContent())
            .type(message.getType())
            .timestamp(message.getTimestamp())
            .build();
    }
}