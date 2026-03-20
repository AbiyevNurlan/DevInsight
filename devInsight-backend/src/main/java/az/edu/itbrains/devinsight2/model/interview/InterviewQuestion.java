package az.edu.itbrains.devinsight2.model.interview;

import az.edu.itbrains.devinsight2.model.submission.AnswerStatus;
import az.edu.itbrains.devinsight2.model.question.Question;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private Integer questionOrder; // 1, 2, 3, etc.

    @Column(columnDefinition = "TEXT")
    private String userTranscript; // Recognized text from audio

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnswerStatus status; // PENDING, ANSWERED, EVALUATED

    // Evaluation Scores (0-100)
    private Integer relevanceScore; // How well answers the question
    private Integer completenessScore; // Covers all key points
    private Integer clarityScore; // Speech clarity and structure
    private Integer confidenceScore; // Speaker confidence
    private Integer overallScore; // Average of above

    @Column(columnDefinition = "TEXT")
    private String aiFeedback; // Detailed feedback from Claude

    @Column(columnDefinition = "TEXT")
    private String strengths; // JSON array: ["strength1", "strength2"]

    @Column(columnDefinition = "TEXT")
    private String weaknesses; // JSON array: ["weakness1", "weakness2"]

    @Column(columnDefinition = "TEXT")
    private String suggestions; // JSON array: ["suggestion1", "suggestion2"]

    // Timestamps
    @Column(nullable = false, updatable = false)
    private LocalDateTime askedAt;

    private LocalDateTime answeredAt;

    private LocalDateTime evaluatedAt;

    private Integer answerDurationSeconds; // How long user spoke

    // Helper methods
    public void calculateOverallScore() {
        if (relevanceScore == null || completenessScore == null ||
                clarityScore == null || confidenceScore == null) {
            this.overallScore = 0;
            return;
        }

        int avg = (relevanceScore + completenessScore + clarityScore + confidenceScore) / 4;
        this.overallScore = avg;
    }

    public boolean isFullyEvaluated() {
        return status == AnswerStatus.EVALUATED &&
                relevanceScore != null &&
                completenessScore != null &&
                clarityScore != null &&
                confidenceScore != null;
    }
}