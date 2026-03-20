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
public class GeneratedQuestionDto {
    private String question;
    private String type; // TECHNICAL, BEHAVIORAL, SITUATIONAL
    private String difficulty; // EASY, MEDIUM, HARD
    private List<String> expectedKeywords;
    private String idealAnswer;
    private Integer maxScore;
    private List<String> evaluationCriteria;
}
