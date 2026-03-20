package az.edu.itbrains.devinsight2.dto.submission;

import az.edu.itbrains.devinsight2.model.submission.AnswerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionAnswerResponseDto {

    private Long answerId;
    private Long questionId;
    private String questionTitle;
    private String userAnswer;
    private Double similarityScore;
    private Double pointsEarned;
    private Integer maxPoints;
    private String feedback;
    private AnswerStatus status;
}
