package az.edu.itbrains.devinsight2.model.interview;

import az.edu.itbrains.devinsight2.model.company.Company;
import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.model.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "interviews")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview { @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewLevel level; // JUNIOR, MID, SENIOR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewType type; // CODING, BEHAVIORAL, SYSTEM_DESIGN, MIXED

    private Integer durationMinutes; // Expected duration

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "employees", "interviews"})
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "skills", "company"})
    private User createdBy;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "interview_question_mapping",
            joinColumns = @JoinColumn(name = "interview_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    @Builder.Default
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnore
    private List<Submission> submissions = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private InterviewStatus status; // DRAFT, ACTIVE, ARCHIVED

    private Boolean isPublic; // Public interviews anyone can take

    private Integer passingScore; // Minimum score to pass (0-100)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = InterviewStatus.DRAFT;
        if (isPublic == null) isPublic = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
