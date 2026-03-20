package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Scorecard DTO for Explainable AI results
 * Provides detailed breakdown of candidate scoring with explanations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScorecardDto {
    
    private Long candidateId;
    private String candidateName;
    private Long jobId;
    private String jobTitle;
    
    // Overall scoring
    private Double totalScore;
    private Double maxScore;
    private Double scorePercentage;
    private String performanceLevel; // EXCELLENT, GOOD, AVERAGE, BELOW_AVERAGE, POOR
    
    // Detailed breakdown by category
    private Map<String, CategoryScore> breakdown;
    
    // Reason codes for scoring
    private List<String> reasonCodes;
    
    // Feature contributions (what influenced the score most)
    private List<FeatureContribution> featureContributions;
    
    // AI explanation
    private String overallExplanation;
    private String recommendation;
    private Double confidenceLevel;
    
    // Metadata
    private LocalDateTime generatedAt;
    private String generatedBy;
    private String modelVersion;
    
    /**
     * Category-wise score breakdown
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryScore {
        private String categoryName;
        private Double score;
        private Double maxScore;
        private Double weight;
        private String explanation;
        private String performanceIndicator; // STRONG, ADEQUATE, WEAK
    }
    
    /**
     * Individual feature contribution to final score
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatureContribution {
        private String featureName;
        private String featureValue;
        private Double contribution; // Positive or negative contribution
        private Double importance; // 0-1 scale
        private String impact; // POSITIVE, NEGATIVE, NEUTRAL
        private String explanation;
    }
}
