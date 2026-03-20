package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralAnalysisResultDto {
    // Sentiment Analysis
    private String sentiment; // POSITIVE, NEUTRAL, NEGATIVE, ANXIOUS, CONFIDENT
    private Double sentimentScore; // 0.0 to 1.0
    
    // Communication Quality
    private Integer clarityScore; // 0-10
    private Integer articulationScore; // 0-10
    private Integer coherenceScore; // 0-10
    
    // Problem-Solving Indicators
    private Integer analyticalThinkingScore; // 0-10
    private Integer structuredApproachScore; // 0-10
    private Integer creativityScore; // 0-10
    
    // Behavioral Traits
    private Integer confidenceLevel; // 0-10
    private Integer collaborationIndicators; // 0-10
    private Integer stressHandling; // 0-10
    
    // Delivery Quality
    private String speechPace; // SLOW, MODERATE, FAST
    private Boolean excessivePauses;
    private Boolean fillerWords; // um, uh, like, you know
    
    // Overall Assessment
    private Integer overallBehavioralScore; // 0-100
    private String recommendation; // INCREASE_DIFFICULTY, MAINTAIN, DECREASE_DIFFICULTY
    private String feedback;
    
    // Detailed Breakdown
    private Map<String, Integer> skillBreakdown;
}
