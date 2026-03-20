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
public class ExplainabilityResponseDto {
    private String decisionType;
    private String overallExplanation;
    
    // Feature Contributions
    private Map<String, Double> featureContributions; // feature -> importance (0-100%)
    private List<String> topPositiveFactors; // What helped
    private List<String> topNegativeFactors; // What hurt
    
    // Reason Codes
    private List<ReasonCode> reasonCodes;
    
    // Score Breakdown
    private Map<String, ScoreBreakdown> scoreBreakdowns;
    
    // Confidence Level
    private Double confidenceLevel; // 0.0-1.0
    private String confidenceExplanation;
    
    // Recommendations
    private List<String> improvementSuggestions;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReasonCode {
        private String code; // e.g., "STRONG_TECHNICAL", "WEAK_COMMUNICATION"
        private String category; // TECHNICAL, BEHAVIORAL, EXPERIENCE, EDUCATION
        private Integer impact; // -100 to +100
        private String description;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreBreakdown {
        private String component;
        private Double score;
        private Double weight;
        private String justification;
        private List<String> evidence; // Specific examples from candidate data
    }
}
