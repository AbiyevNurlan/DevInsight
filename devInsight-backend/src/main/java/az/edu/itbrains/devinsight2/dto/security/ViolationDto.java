package az.edu.itbrains.devinsight2.dto.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationDto {
    private Long id;
    private String type;
    private String details;
    private String severity;
    private LocalDateTime timestamp;
    private String userName;
    private String userEmail;
    private String interviewTitle;
    private Long interviewId;
    private String ipAddress;
    private Boolean resolved;
    private Boolean hrNotified;
}
