package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerScoreDto {
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private String feedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private Map<String, Integer> criteriaScores; // e.g., "clarity": 8, "depth": 7
    private List<String> missedKeywords;
    private String recommendation;
}
