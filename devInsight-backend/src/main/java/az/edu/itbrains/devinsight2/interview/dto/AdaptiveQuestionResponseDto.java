package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveQuestionResponseDto {
    private String nextQuestion;
    private Integer adjustedDifficulty; // 1-10
    private String difficultyChange; // INCREASED, MAINTAINED, DECREASED
    private String reasoning;
    private String expectedAnswer;
    private String evaluationFocus; // what to focus on in the answer
}
