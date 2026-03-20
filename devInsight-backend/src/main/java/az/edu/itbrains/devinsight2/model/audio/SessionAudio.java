package az.edu.itbrains.devinsight2.model.audio;

import az.edu.itbrains.devinsight2.model.interview.InterviewQuestion;
import az.edu.itbrains.devinsight2.model.interview.InterviewSession;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_audios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionAudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private InterviewQuestion question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AudioType audioType; // QUESTION (AI generates), ANSWER (User records)

    @Column(nullable = false)
    private String audioUrl; // S3 URL

    @Column(nullable = false)
    private String contentType; // audio/mp3, audio/wav, etc.

    @Column(nullable = false)
    private Long fileSizeBytes;

    @Column(nullable = false)
    private Integer durationSeconds;

    @Column(columnDefinition = "TEXT")
    private String transcription; // For ANSWER type audio

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt; // When transcription was completed

    // For debugging/testing
    private String processingStatus; // PENDING, PROCESSING, COMPLETED, FAILED
    private String processingError; // Error message if failed
}