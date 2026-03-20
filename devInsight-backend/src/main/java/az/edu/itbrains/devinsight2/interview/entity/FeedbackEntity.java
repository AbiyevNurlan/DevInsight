package az.edu.itbrains.devinsight2.interview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;
    
    @Column(name = "candidate_name")
    private String candidateName;
    
    @Column(name = "actual_outcome")
    private String actualOutcome;
    
    @Column(name = "outcome_date")
    private LocalDateTime outcomeDate;
    
    @Column(name = "performance_rating")
    private String performanceRating;
    
    @Column(name = "retention_months")
    private Integer retentionMonths;
    
    @Column(name = "still_employed")
    private Boolean stillEmployed;
    
    @Column(name = "ai_prediction")
    private String aiPrediction;
    
    @Column(name = "ai_confidence")
    private Double aiConfidence;
    
    @Column(name = "prediction_correct")
    private Boolean predictionCorrect;
    
    @Column(name = "prediction_accuracy")
    private String predictionAccuracy;
    
    @Column(name = "feedback_category")
    private String feedbackCategory;
    
    @Column(name = "learning_points", columnDefinition = "TEXT")
    private String learningPoints;
    
    @Column(name = "model_adjustment_needed", columnDefinition = "TEXT")
    private String modelAdjustmentNeeded;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
