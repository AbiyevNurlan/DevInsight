package az.edu.itbrains.devinsight2.model.question;

import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.model.interview.InterviewFeedback;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Question-level feedback for detailed analysis
 */
@Entity
@Table(name = "question_feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_feedback_id", nullable = false)
    private InterviewFeedback interviewFeedback;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;
    
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal score;  // 0-100
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(columnDefinition = "TEXT")
    private String keyPointsCovered;
    
    @Column(columnDefinition = "TEXT")
    private String missedPoints;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
