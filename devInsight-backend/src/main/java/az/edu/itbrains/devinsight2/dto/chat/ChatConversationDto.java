package az.edu.itbrains.devinsight2.dto.chat;

import az.edu.itbrains.devinsight2.model.chat.ChatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversationDto {
    
    private Long id;
    private Long candidateId;
    private String candidateName;
    private Long interviewId;
    private String interviewTitle;
    private ChatStatus status;
    private Double interviewScore;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<ChatMessageDto> messages;
    private int messageCount;
}