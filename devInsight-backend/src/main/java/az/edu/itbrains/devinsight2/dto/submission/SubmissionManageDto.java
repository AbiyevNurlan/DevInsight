package az.edu.itbrains.devinsight2.dto.submission;

import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionManageDto {
    private Long id;
    private Long interviewId;
    private String interviewTitle;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private Long questionId;
    private String questionTitle;
    private String codeSubmission;
    private String textAnswer;
    private String videoUrl;
    private SubmissionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeSpentSeconds;
    private LocalDateTime createdAt;
    
    // Analysis info
    private Integer overallScore;
    private String feedback;
}
