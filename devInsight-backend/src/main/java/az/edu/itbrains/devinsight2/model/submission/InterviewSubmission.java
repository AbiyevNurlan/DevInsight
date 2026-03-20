package az.edu.itbrains.devinsight2.model.submission;

import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_submissions", 
       uniqueConstraints = @UniqueConstraint(
           name = "uk_interview_user",
           columnNames = {"interview_id", "user_id"}
       ))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User submittedBy;

    @OneToMany(mappedBy = "submission", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = jakarta.persistence.FetchType.LAZY)
    @Builder.Default
    private List<QuestionAnswer> answers = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Double totalScore = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalQuestions = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer answeredQuestions = 0;

    @Builder.Default
    private Double percentageScore = 0.0; // (totalScore / (totalQuestions * maxPoints)) * 100

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status; // DRAFT, SUBMITTED, EVALUATED

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime submittedAt;

    private LocalDateTime evaluatedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = SubmissionStatus.DRAFT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
