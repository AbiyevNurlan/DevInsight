package az.edu.itbrains.devinsight2.interview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_trail")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditTrailEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "candidate_id")
    private Long candidateId;
    
    @Column(name = "candidate_name")
    private String candidateName;
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(name = "action", nullable = false)
    private String action;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "decision_maker")
    private String decisionMaker;
    
    @Column(name = "model_version")
    private String modelVersion;
    
    @Column(name = "input_data", columnDefinition = "TEXT")
    private String inputData; // JSON string
    
    @Column(name = "output_data", columnDefinition = "TEXT")
    private String outputData; // JSON string
    
    @Column(name = "score")
    private Double score;
    
    @Column(name = "recommendation")
    private String recommendation;
    
    @Column(name = "reasoning", columnDefinition = "TEXT")
    private String reasoning;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "user_role")
    private String userRole;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "gdpr_compliant")
    private Boolean gdprCompliant;
    
    @Column(name = "bias_checked")
    private Boolean biasChecked;
    
    @Column(name = "compliance_notes", columnDefinition = "TEXT")
    private String complianceNotes;
}
