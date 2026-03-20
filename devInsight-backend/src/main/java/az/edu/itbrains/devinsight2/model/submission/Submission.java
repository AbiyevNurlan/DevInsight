package az.edu.itbrains.devinsight2.model.submission;

import az.edu.itbrains.devinsight2.model.core.Analysis;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.model.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {
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
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String answerText; // Unified answer text field

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(columnDefinition = "TEXT")
    private String codeSubmission; // For coding questions

    @Column(columnDefinition = "TEXT")
    private String textAnswer; // For behavioral questions

    private String videoUrl; // Video recording URL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status; // IN_PROGRESS, SUBMITTED, ANALYZED

    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    private Integer timeSpentSeconds;

    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL)
    private Analysis analysis;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = SubmissionStatus.IN_PROGRESS;
        if (startedAt == null) startedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
