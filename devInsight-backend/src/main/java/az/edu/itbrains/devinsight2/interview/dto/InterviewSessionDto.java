package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionDto {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String sessionType; // TEXT_ONLY, VOICE_ONLY, VIDEO, MULTIMODAL
    private String status; // SCHEDULED, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED
    private String mode; // REAL_TIME, ASYNCHRONOUS
    
    private String scheduledTime;
    private String startTime;
    private String endTime;
    private Integer duration; // in seconds
    
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private Double currentScore;
    
    private String roomId; // for real-time sessions
    private String recordingUrl;
    private String transcriptUrl;
}
