package az.edu.itbrains.devinsight2.model.question;

import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type; // CODING, BEHAVIORAL, MULTIPLE_CHOICE

    @Enumerated(EnumType.STRING)
    private QuestionDifficulty difficulty; // EASY, MEDIUM, HARD

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_tags", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>(); // java, algorithms, arrays, etc.

    // For coding questions
    private String programmingLanguage; // java, python, javascript

    @Column(columnDefinition = "TEXT")
    private String starterCode;

    @Column(columnDefinition = "TEXT")
    private String solution;  // Expected answer/solution for grading

    @Column(columnDefinition = "TEXT")
    private String testCases; // JSON format

    // For MULTIPLE_CHOICE questions
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    @Builder.Default
    private List<String> options = new ArrayList<>();  // Multiple choice options

    @Column(columnDefinition = "TEXT")
    private String correctAnswer;  // Correct answer for MULTIPLE_CHOICE or text-based questions

    // For behavioral questions
    @Column(columnDefinition = "TEXT")
    private String evaluationCriteria;

    // Scoring
    private Integer maxPoints;
    private Integer timeLimit; // in seconds

    @ManyToMany(mappedBy = "questions")
    @Builder.Default
    @JsonIgnore
    private List<Interview> interviews = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnore
    private User createdBy;

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
