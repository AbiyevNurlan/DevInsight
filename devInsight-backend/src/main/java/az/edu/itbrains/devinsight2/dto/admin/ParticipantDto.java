package az.edu.itbrains.devinsight2.dto.admin;

import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for displaying interview participants in admin panel
 * Contains participant info, exam timing, and results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class    ParticipantDto {
    private Long id;
    
    // Participant info
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String role;
    
    // Interview info
    private Long interviewId;
    private String interviewTitle;
    
    // Timing info
    private LocalDateTime examStartTime;
    private LocalDateTime examEndTime;
    private Integer durationMinutes;
    private Integer timeSpentSeconds;
    
    // Results info
    private SubmissionStatus status;
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private String feedback;
    private Boolean passed;
    
    // Additional info
    private LocalDateTime createdAt;
    private String companyName;
}
