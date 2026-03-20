package az.edu.itbrains.devinsight2.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionProgressDto {
    private Long sessionId;
    private Integer currentQuestionNumber;
    private Integer totalQuestions;
    private Integer totalAnswered;
    private Integer totalEvaluated;
    private Integer currentScore;
    private String status;
    private LocalDateTime startedAt;
}