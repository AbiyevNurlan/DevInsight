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
public class CandidatePotentialResponseDto {
    private Double growthPotentialScore;      // 0-100
    private String potentialLevel;             // EXCEPTIONAL, HIGH, MODERATE, LIMITED
    private Double predictedPerformance6Mo;   // predicted score after 6 months
    private Double predictedPerformance1Yr;   // predicted score after 1 year

    // Learning velocity
    private Double learningSpeed;             // 0-100
    private String learningStyle;             // FAST_ADAPTER, STEADY_GROWER, DEEP_DIVER, PATTERN_MATCHER
    private Boolean showsRapidImprovement;
    private Double hintUtilizationScore;      // how well they learn from hints

    // Adaptability signals
    private Double adaptabilityScore;         // 0-100
    private Double problemSolvingCreativity;  // 0-100
    private Double unfamiliarTopicHandling;   // how well they handle unknown areas

    // Career trajectory prediction
    private String predictedTrajectory;       // LEADER, SPECIALIST, ARCHITECT, GENERALIST
    private List<String> highPotentialAreas;  // areas where they could excel
    private List<String> developmentAreas;    // areas needing growth
    private Integer estimatedTimeToSenior;    // months to reach senior level

    // Comparison
    private Double percentileRank;            // compared to similar candidates
    private Map<String, Double> dimensionScores; // {learning: 85, adaptability: 72, ...}

    // AI insights
    private String executiveSummary;
    private List<String> keyStrengths;
    private List<String> investmentRisks;
    private String hiringRecommendation;      // STRONG_HIRE, HIRE, BORDERLINE, PASS
    private String reasoning;
}
