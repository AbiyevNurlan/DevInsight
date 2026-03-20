package az.edu.itbrains.devinsight2.dto.candidate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for candidate interview history
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateInterviewHistoryDto {
    
    private Long interviewId;
    private String interviewTitle;
    private String interviewType;
    private String companyName;
    
    private Long submissionId;
    private String submissionStatus;
    private Double score;
    private String feedback;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer durationMinutes;
    
    // Question statistics
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private Double completionRate;
}
