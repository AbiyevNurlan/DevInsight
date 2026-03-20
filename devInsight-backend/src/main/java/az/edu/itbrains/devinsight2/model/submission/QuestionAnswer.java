package az.edu.itbrains.devinsight2.model.submission;

import az.edu.itbrains.devinsight2.model.question.Question;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "question_answers",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_submission_question",
           columnNames = {"submission_id", "question_id"}
       ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnore
    private InterviewSubmission submission;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String userAnswer;

    @Column(columnDefinition = "TEXT")
    private String correctAnswer; // Stored for reference/comparison

    @Column(nullable = false)
    @Builder.Default
    private Double similarityScore = 0.0; // 0-100 percentage

    @Column(nullable = false)
    @Builder.Default
    private Double pointsEarned = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxPoints = 0;

    @Column(columnDefinition = "TEXT")
    private String feedback; // Optional feedback for user

    @Enumerated(EnumType.STRING)
    private AnswerStatus status; // CORRECT, PARTIAL, INCORRECT

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            // Auto-determine status based on similarity
            if (similarityScore >= 80) {
                status = AnswerStatus.CORRECT;
            } else if (similarityScore >= 50) {
                status = AnswerStatus.PARTIAL;
            } else {
                status = AnswerStatus.INCORRECT;
            }
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
