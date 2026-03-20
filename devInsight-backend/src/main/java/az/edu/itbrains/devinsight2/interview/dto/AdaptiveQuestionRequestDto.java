package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveQuestionRequestDto {
    private String currentQuestion;
    private String candidateAnswer;
    private Integer currentDifficulty; // 1-10
    private Double candidatePerformance; // 0.0-1.0 (percentage of correct answers)
    private String topicArea;
    private List<String> askedQuestions; // to avoid repetition
}
