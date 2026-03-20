package az.edu.itbrains.devinsight2.controller.chat;

import az.edu.itbrains.devinsight2.dto.chat.*;
import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.service.chat.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat", description = "Post-interview AI chat functionality")
public class ChatController {
    
    private final ChatService chatService;
    
    @GetMapping("/test")
    @Operation(summary = "Test chat endpoint", description = "Test endpoint to verify authentication and role")
    public ResponseEntity<ApiResponse<String>> testChatEndpoint() {
        try {
            log.info("Testing chat endpoint access");
            return ResponseEntity.ok(ApiResponse.success("Chat endpoint accessible", "OK"));
        } catch (Exception e) {
            log.error("Error accessing chat test endpoint: ", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to access chat endpoint: " + e.getMessage()));
        }
    }
    
    @PostMapping("/start")
    @Operation(summary = "Start post-interview chat", description = "Initialize AI chat conversation after successful interview")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Chat conversation started successfully",
            content = @Content(schema = @Schema(implementation = ChatConversationDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request or insufficient score"
        )
    })
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ChatConversationDto>> startChat(
            @RequestParam Long interviewId,
            @RequestParam Double interviewScore
    ) {
        log.info("Starting chat for interview: {}, score: {}", interviewId, interviewScore);
        
        try {
            ChatConversationDto conversation = chatService.startConversation(interviewId, interviewScore);
            log.info("Chat conversation started successfully with ID: {}", conversation.getId());
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Chat conversation started successfully", conversation));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for starting chat: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid request: " + e.getMessage()));
        } catch (IllegalStateException e) {
            log.warn("Chat already exists: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Chat already exists: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error starting chat conversation: ", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to start chat: " + e.getMessage()));
        }
    }
    
    @PostMapping("/message")
    @Operation(summary = "Send chat message", description = "Send a message in the chat conversation")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Message sent successfully",
            content = @Content(schema = @Schema(implementation = ChatMessageDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request or conversation not accessible"
        )
    })
    @PreAuthorize("hasAnyRole('CANDIDATE', 'USER')")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(
            @Valid @RequestBody SendMessageRequest request
    ) {
        log.info("Sending message to conversation: {}", request.getConversationId());
        
        try {
            ChatMessageDto message = chatService.sendMessage(request.getConversationId(), request.getContent());
            return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
        } catch (Exception e) {
            log.error("Error sending message: ", e);
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to send message: " + e.getMessage()));
        }
    }
    
    @GetMapping("/history/{conversationId}")
    @Operation(summary = "Get chat history", description = "Retrieve chat conversation history")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Chat history retrieved successfully",
            content = @Content(schema = @Schema(implementation = ChatConversationDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Conversation not found"
        )
    })
    @PreAuthorize("hasAnyRole('CANDIDATE', 'HR', 'USER')")
    public ResponseEntity<ApiResponse<ChatConversationDto>> getChatHistory(
            @PathVariable Long conversationId
    ) {
        log.info("Getting chat history for conversation: {}", conversationId);
        
        try {
            ChatConversationDto conversation = chatService.getChatHistory(conversationId);
            return ResponseEntity.ok(ApiResponse.success("Chat history retrieved successfully", conversation));
        } catch (Exception e) {
            log.error("Error retrieving chat history: ", e);
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Failed to retrieve chat history: " + e.getMessage()));
        }
    }
    
    @GetMapping("/conversations")
    @Operation(summary = "Get user conversations", description = "Get all chat conversations for current user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Conversations retrieved successfully"
        )
    })
    @PreAuthorize("hasAnyRole('CANDIDATE', 'USER')")
    public ResponseEntity<ApiResponse<List<ChatConversationDto>>> getUserConversations() {
        log.info("Getting conversations for current user");
        
        try {
            List<ChatConversationDto> conversations = chatService.getUserConversations();
            return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", conversations));
        } catch (Exception e) {
            log.error("Error retrieving user conversations: ", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve conversations: " + e.getMessage()));
        }
    }
    
    @PutMapping("/complete/{conversationId}")
    @Operation(summary = "Complete conversation", description = "Mark conversation as completed")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Conversation completed successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Conversation not found"
        )
    })
    @PreAuthorize("hasAnyRole('CANDIDATE', 'USER')")
    public ResponseEntity<ApiResponse<String>> completeConversation(
            @PathVariable Long conversationId
    ) {
        log.info("Completing conversation: {}", conversationId);
        
        try {
            chatService.completeConversation(conversationId);
            return ResponseEntity.ok(ApiResponse.success("Conversation completed successfully", "OK"));
        } catch (Exception e) {
            log.error("Error completing conversation: ", e);
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Failed to complete conversation: " + e.getMessage()));
        }
    }
}