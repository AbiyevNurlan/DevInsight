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
public class PredictiveHiringResponseDto {
    private Long candidateId;
    private Long companyId;

    // Core predictions
    private Double offerAcceptanceProbability;   // 0-100%
    private Double retentionRisk;                // 0-100% (probability of leaving in 12 months)
    private Double performancePrediction;        // 0-100 (predicted performance rating)
    private Integer estimatedTimeToHireDays;     // predicted days to close
    private Double cultureFitProbability;        // 0-100%

    // Salary intelligence
    private SalaryBenchmark salaryBenchmark;

    // Retention analysis
    private RetentionAnalysis retentionAnalysis;

    // Pipeline optimization
    private PipelineOptimization pipelineOptimization;

    // Risk factors
    private List<RiskFactor> riskFactors;

    // AI insights
    private String summary;
    private List<String> actionRecommendations;
    private String hiringUrgency;                // IMMEDIATE, STANDARD, CAN_WAIT, NO_RUSH
    private Double overallHiringConfidence;      // 0-100

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryBenchmark {
        private Double marketMedian;
        private Double marketP25;
        private Double marketP75;
        private Double candidateExpectation;
        private Double recommendedOffer;
        private String offerCompetitiveness;     // BELOW_MARKET, AT_MARKET, ABOVE_MARKET, PREMIUM
        private Double salaryToPerformanceRatio; // ROI prediction
        private Map<String, Double> regionalComparison; // salary by city/region
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RetentionAnalysis {
        private Double sixMonthRetention;        // probability stays 6 months
        private Double oneYearRetention;
        private Double twoYearRetention;
        private List<String> retentionRiskFactors;
        private List<String> retentionStrengthFactors;
        private String bestRetentionStrategy;
        private Double flightRiskScore;          // 0-100 (higher = more likely to leave)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PipelineOptimization {
        private Integer optimalInterviewRounds;
        private Integer currentRound;
        private Boolean skipNextRound;           // AI recommendation
        private String bottleneck;               // where pipeline is slow
        private Double pipelineHealthScore;      // 0-100
        private List<String> speedUpSuggestions;
        private Integer daysToDecision;          // recommended
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskFactor {
        private String factor;
        private String impact;                   // LOW, MEDIUM, HIGH, CRITICAL
        private Double probability;              // 0-100
        private String mitigation;
    }
}
