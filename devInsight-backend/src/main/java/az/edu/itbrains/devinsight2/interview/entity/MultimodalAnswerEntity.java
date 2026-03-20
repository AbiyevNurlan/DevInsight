package az.edu.itbrains.devinsight2.interview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "multimodal_answer")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultimodalAnswerEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_id", nullable = false)
    private Long sessionId;
    
    @Column(name = "question_id")
    private Long questionId;
    
    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;
    
    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;
    
    @Column(name = "audio_url")
    private String audioUrl;
    
    @Column(name = "audio_transcript", columnDefinition = "TEXT")
    private String audioTranscript;
    
    @Column(name = "audio_duration")
    private Integer audioDuration;
    
    @Column(name = "audio_metrics", columnDefinition = "TEXT")
    private String audioMetrics; // JSON
    
    @Column(name = "video_url")
    private String videoUrl;
    
    @Column(name = "video_transcript", columnDefinition = "TEXT")
    private String videoTranscript;
    
    @Column(name = "video_duration")
    private Integer videoDuration;
    
    @Column(name = "video_metrics", columnDefinition = "TEXT")
    private String videoMetrics; // JSON
    
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
