package az.edu.itbrains.devinsight2.model.core;

import az.edu.itbrains.devinsight2.model.submission.Submission;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    // Overall scores (0-100)
    private Integer overallScore;
    private Integer codeQualityScore;
    private Integer algorithmEfficiencyScore;
    private Integer communicationScore;
    private Integer problemSolvingScore;

    // Detailed feedback
    @Column(columnDefinition = "TEXT")
    private String aiGeneratedFeedback;

    @Column(columnDefinition = "TEXT")
    private String codeReview; // Line-by-line code review

    @Column(columnDefinition = "TEXT")
    private String strengths; // JSON array

    @Column(columnDefinition = "TEXT")
    private String weaknesses; // JSON array

    @Column(columnDefinition = "TEXT")
    private String recommendations; // JSON array

    // Code analysis
    private Integer linesOfCode;
    private String timeComplexity; // O(n), O(n^2), etc.
    private String spaceComplexity;

    @Column(columnDefinition = "TEXT")
    private String codeSmells; // JSON array

    private Boolean passedAllTestCases;
    private Integer testCasesPassed;
    private Integer totalTestCases;

    // Video analysis (if applicable)
    @Column(columnDefinition = "TEXT")
    private String videoAnalysis;

    private Integer eyeContactScore;
    private Integer clarityScore;
    private Integer confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String emotionalAnalysis; // JSON format

    // Metadata
    private String aiModel; // claude-sonnet-4, etc.
    private Integer tokensUsed;
    private Integer analysisTimeMs;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

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
