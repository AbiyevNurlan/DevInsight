package az.edu.itbrains.devinsight2.model.interview;

import az.edu.itbrains.devinsight2.model.core.FeedbackRecommendation;
import az.edu.itbrains.devinsight2.model.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Interview feedback model
 * HR provides detailed feedback for candidates after interviews
 */
@Entity
@Table(name = "interview_feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;  // HR who gave feedback
    
    // Overall rating (1-5)
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal overallRating;
    
    // Detailed ratings
    @Column(precision = 3, scale = 2)
    private BigDecimal technicalSkillsRating;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal communicationRating;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal problemSolvingRating;
    
    @Column(precision = 3, scale = 2)
    private BigDecimal cultureFitRating;
    
    // Text feedback
    @Column(columnDefinition = "TEXT")
    private String strengths;
    
    @Column(columnDefinition = "TEXT")
    private String areasForImprovement;
    
    @Column(columnDefinition = "TEXT")
    private String detailedComments;
    
    // Recommendation
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackRecommendation recommendation;
    
    // Visibility settings
    @Column(nullable = false)
    @Builder.Default
    private Boolean visibleToCandidate = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFinalized = false;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private LocalDateTime sharedWithCandidateAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
