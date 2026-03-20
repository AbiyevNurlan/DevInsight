package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HRReviewDto {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private Long jobId;
    private String jobTitle;
    
    // AI Generated Artifacts
    private Map<String, Object> cvAnalysis;
    private Map<String, Object> interviewScores;
    private Map<String, Object> behavioralAnalysis;
    private Map<String, Object> skillGapAnalysis;
    private Map<String, Object> matchingScore;
    
    // AI Recommendation
    private String aiRecommendation; // STRONG_YES, YES, MAYBE, NO
    private Double aiConfidence; // 0-100
    private String aiReasoning;
    
    // HR Review
    private String hrRecommendation; // HIRE, REJECT, INTERVIEW_AGAIN, WAITLIST
    private String hrNotes;
    private String hrDecisionReasoning;
    private Boolean agreesWithAI;
    private String disagreementReason;
    
    // Final Decision
    private String finalDecision; // HIRED, REJECTED, PENDING
    private String decisionMaker; // HR_MANAGER, HIRING_MANAGER, COMMITTEE
    private String timestamp;
}
