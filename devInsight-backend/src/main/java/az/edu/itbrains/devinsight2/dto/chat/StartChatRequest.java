package az.edu.itbrains.devinsight2.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartChatRequest {
    
    private Long interviewId;
    
    private Double interviewScore;
    
    @NotBlank(message = "Message cannot be blank")
    private String initialMessage;
}