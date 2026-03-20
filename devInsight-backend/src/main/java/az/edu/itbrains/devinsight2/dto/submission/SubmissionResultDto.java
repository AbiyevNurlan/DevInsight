package az.edu.itbrains.devinsight2.dto.submission;

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
public class SubmissionResultDto {

    private Long submissionId;
    private Long interviewId;
    private String interviewTitle;
    private Double totalScore;
    private Integer totalQuestions;
    private Integer answeredQuestions;
    private Double percentageScore;
    private String status;
    private LocalDateTime submittedAt;
    private List<QuestionAnswerResponseDto> results;
}
