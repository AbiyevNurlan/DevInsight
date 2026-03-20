package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelPerformanceMetricsDto {
    // Overall Metrics
    private Integer totalPredictions;
    private Integer correctPredictions;
    private Double accuracy; // 0-100%
    
    // Confusion Matrix
    private Integer truePositives;  // AI said HIRE, actually HIRED
    private Integer trueNegatives;  // AI said NO, actually REJECTED
    private Integer falsePositives; // AI said HIRE, actually REJECTED
    private Integer falseNegatives; // AI said NO, actually HIRED
    
    // Advanced Metrics
    private Double precision; // TP / (TP + FP)
    private Double recall;    // TP / (TP + FN)
    private Double f1Score;   // 2 * (precision * recall) / (precision + recall)
    
    // Confidence Calibration
    private Double averageConfidenceWhenCorrect;
    private Double averageConfidenceWhenIncorrect;
    private Boolean wellCalibrated;
    
    // Bias Detection
    private String biasAnalysis;
    private Boolean biasDetected;
    
    // Recommendations
    private String modelStatus; // EXCELLENT, GOOD, NEEDS_TUNING, NEEDS_RETRAINING
    private String recommendations;
}
