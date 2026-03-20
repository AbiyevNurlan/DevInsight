package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    private Long candidateId;
    private String candidateName;
    
    // Outcome
    private String actualOutcome; // HIRED, REJECTED, WITHDRAWN
    private String outcomeDate;
    
    // Performance (for hired candidates)
    private String performanceRating; // EXCELLENT, GOOD, SATISFACTORY, POOR
    private Integer retentionMonths;
    private Boolean stillEmployed;
    
    // AI Prediction vs Reality
    private String aiPrediction;
    private Double aiConfidence;
    private Boolean predictionCorrect;
    private String predictionAccuracy; // ACCURATE, PARTIALLY_ACCURATE, INACCURATE
    
    // Feedback for Model Improvement
    private String feedbackCategory; // FALSE_POSITIVE, FALSE_NEGATIVE, TRUE_POSITIVE, TRUE_NEGATIVE
    private String learningPoints;
    private String modelAdjustmentNeeded;
}
