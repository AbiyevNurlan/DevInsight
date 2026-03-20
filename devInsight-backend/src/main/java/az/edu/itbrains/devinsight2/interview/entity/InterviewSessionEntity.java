package az.edu.itbrains.devinsight2.interview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_session")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;
    
    @Column(name = "candidate_name")
    private String candidateName;
    
    @Column(name = "session_type", nullable = false)
    private String sessionType;
    
    @Column(name = "status", nullable = false)
    private String status;
    
    @Column(name = "mode")
    private String mode;
    
    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "duration")
    private Integer duration;
    
    @Column(name = "total_questions")
    private Integer totalQuestions;
    
    @Column(name = "answered_questions")
    private Integer answeredQuestions;
    
    @Column(name = "current_score")
    private Double currentScore;
    
    @Column(name = "room_id")
    private String roomId;
    
    @Column(name = "recording_url")
    private String recordingUrl;
    
    @Column(name = "transcript_url")
    private String transcriptUrl;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
