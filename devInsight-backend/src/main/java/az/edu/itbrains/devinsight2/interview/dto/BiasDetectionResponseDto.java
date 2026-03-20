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
public class BiasDetectionResponseDto {
    private Double overallFairnessScore;      // 0-100 (100 = perfectly fair)
    private String riskLevel;                  // LOW, MEDIUM, HIGH, CRITICAL
    private Integer totalBiasIndicators;

    // Specific bias types detected
    private List<BiasIndicator> biasIndicators;

    // Question fairness
    private Double questionFairnessScore;     // 0-100
    private List<String> unfairQuestions;

    // Scoring consistency
    private Double scoringConsistencyScore;   // 0-100
    private Map<String, Double> scoringByDemographic;

    // Language analysis
    private List<String> biasedLanguageFound;
    private List<String> suggestedAlternatives;

    // Recommendations
    private List<String> actionItems;
    private String summary;
    private List<String> bestPractices;

    // Historical trend
    private String trendDirection;            // IMPROVING, WORSENING, STABLE
    private Double previousFairnessScore;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BiasIndicator {
        private String biasType;         // GENDER, AFFINITY, HALO_EFFECT, CONFIRMATION, ANCHORING
        private String description;
        private Double severity;         // 0-1
        private String evidence;
        private String mitigation;
    }
}
