package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerEvaluationRequestDto {
    private String question;
    private String candidateAnswer;
    private String expectedKeywords;
    private String idealAnswer;
    private String evaluationCriteria;
    private Integer maxScore;
}
