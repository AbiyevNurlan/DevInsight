package az.edu.itbrains.devinsight2.dto.interview;

import az.edu.itbrains.devinsight2.dto.question.AnswerDetailDto;
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
public class SessionReportDto {
    private Long sessionId;
    private Integer overallScore;
    private Integer totalQuestions;
    private List<AnswerDetailDto> answers;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer durationMinutes;
}