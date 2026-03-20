package az.edu.itbrains.devinsight2.dto.chat;

import az.edu.itbrains.devinsight2.model.chat.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    
    private Long id;
    private String content;
    private MessageType type;
    private LocalDateTime timestamp;
}