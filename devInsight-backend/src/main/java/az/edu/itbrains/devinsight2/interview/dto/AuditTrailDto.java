package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditTrailDto {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String eventType; // CV_ANALYSIS, QUESTION_GENERATION, SCORING, SHORTLIST, BEHAVIORAL_ANALYSIS
    private String action; // CREATED, UPDATED, EVALUATED, RANKED
    private LocalDateTime timestamp;
    
    // Decision Details
    private String decisionMaker; // AI_MODEL, HR_USER, SYSTEM
    private String modelVersion; // e.g., "claude-3-5-sonnet-20241022"
    private Map<String, Object> inputData;
    private Map<String, Object> outputData;
    
    // Scores & Results
    private Double score;
    private String recommendation;
    private String reasoning;
    
    // User Context
    private String userId;
    private String userRole;
    private String ipAddress;
    
    // Compliance
    private Boolean gdprCompliant;
    private Boolean biasChecked;
    private String complianceNotes;
}
