package az.edu.itbrains.devinsight2.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {
    
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;
    
    @NotBlank(message = "Message content cannot be blank")
    private String content;
}