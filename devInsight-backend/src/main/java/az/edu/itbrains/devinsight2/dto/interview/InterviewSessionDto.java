package az.edu.itbrains.devinsight2.dto.interview;

import az.edu.itbrains.devinsight2.model.interview.InterviewSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSessionDto {
    private Long id;
    private String sessionToken;
    private String status;
    private Integer overallScore;
    private Integer totalQuestionsAnswered;
    private Integer totalQuestionsEvaluated;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public InterviewSessionDto(InterviewSession session) {
        this.id = session.getId();
        this.sessionToken = session.getSessionToken();
        this.status = session.getStatus().name();
        this.overallScore = session.getOverallScore();
        this.totalQuestionsAnswered = session.getTotalQuestionsAnswered();
        this.totalQuestionsEvaluated = session.getTotalQuestionsEvaluated();
        this.startedAt = session.getStartedAt();
        this.completedAt = session.getCompletedAt();
    }
}
