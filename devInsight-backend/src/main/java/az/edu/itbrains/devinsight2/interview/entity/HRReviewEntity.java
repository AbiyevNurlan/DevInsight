package az.edu.itbrains.devinsight2.interview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hr_review")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HRReviewEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;
    
    @Column(name = "candidate_name")
    private String candidateName;
    
    @Column(name = "job_id")
    private Long jobId;
    
    @Column(name = "job_title")
    private String jobTitle;
    
    @Column(name = "cv_analysis", columnDefinition = "TEXT")
    private String cvAnalysis; // JSON
    
    @Column(name = "interview_scores", columnDefinition = "TEXT")
    private String interviewScores; // JSON
    
    @Column(name = "behavioral_analysis", columnDefinition = "TEXT")
    private String behavioralAnalysis; // JSON
    
    @Column(name = "skill_gap_analysis", columnDefinition = "TEXT")
    private String skillGapAnalysis; // JSON
    
    @Column(name = "matching_score", columnDefinition = "TEXT")
    private String matchingScore; // JSON
    
    @Column(name = "ai_recommendation")
    private String aiRecommendation;
    
    @Column(name = "ai_confidence")
    private Double aiConfidence;
    
    @Column(name = "ai_reasoning", columnDefinition = "TEXT")
    private String aiReasoning;
    
    @Column(name = "hr_recommendation")
    private String hrRecommendation;
    
    @Column(name = "hr_notes", columnDefinition = "TEXT")
    private String hrNotes;
    
    @Column(name = "hr_decision_reasoning", columnDefinition = "TEXT")
    private String hrDecisionReasoning;
    
    @Column(name = "agrees_with_ai")
    private Boolean agreesWithAI;
    
    @Column(name = "disagreement_reason", columnDefinition = "TEXT")
    private String disagreementReason;
    
    @Column(name = "final_decision")
    private String finalDecision;
    
    @Column(name = "decision_maker")
    private String decisionMaker;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
