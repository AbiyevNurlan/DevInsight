package az.edu.itbrains.devinsight2.model.interview;

import az.edu.itbrains.devinsight2.model.submission.AnswerStatus;
import az.edu.itbrains.devinsight2.model.audio.SessionStatus;
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
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status; // ACTIVE, COMPLETED, PAUSED, FAILED

    @Column(unique = true, nullable = false)
    private String sessionToken; // UUID for WebSocket authentication

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InterviewQuestion> questions = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private LocalDateTime pausedAt;

    private Integer overallScore; // Average of all question scores

    @Column(columnDefinition = "TEXT")
    private String sessionNotes;

    private Integer totalQuestionsAnswered;

    private Integer totalQuestionsEvaluated;

    // Helper methods
    public void addQuestion(InterviewQuestion question) {
        questions.add(question);
        question.setSession(this);
    }

    public void removeQuestion(InterviewQuestion question) {
        questions.remove(question);
        question.setSession(null);
    }

    public int getAnsweredQuestionsCount() {
        return (int) questions.stream()
                .filter(q -> q.getStatus() != null && !q.getStatus().equals(AnswerStatus.PENDING))
                .count();
    }

    public int getEvaluatedQuestionsCount() {
        return (int) questions.stream()
                .filter(q -> q.getStatus() == AnswerStatus.EVALUATED)
                .count();
    }

    public void calculateOverallScore() {
        if (questions.isEmpty()) {
            this.overallScore = 0;
            return;
        }

        int avgScore = (int) questions.stream()
                .filter(q -> q.getOverallScore() != null)
                .mapToInt(InterviewQuestion::getOverallScore)
                .average()
                .orElse(0);

        this.overallScore = avgScore;
    }
}