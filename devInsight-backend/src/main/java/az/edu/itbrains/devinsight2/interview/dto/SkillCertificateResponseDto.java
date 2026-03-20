package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillCertificateResponseDto {
    private String certificateId;              // UUID
    private String blockchainHash;             // SHA-256 hash for verification
    private String previousHash;               // chain integrity
    private Long blockIndex;                   // position in chain

    // Certificate details
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String skillName;
    private String proficiencyLevel;
    private Double score;
    private List<SkillDetail> verifiedSkills;
    private String issuedBy;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private String status;                     // ACTIVE, EXPIRED, REVOKED

    // Verification
    private String verificationUrl;            // public URL to verify cert
    private String qrCode;                     // Base64 encoded QR code for verification
    private Boolean chainValid;                // blockchain integrity check
    private Integer chainLength;               // total certs in chain

    // Digital signature
    private String digitalSignature;           // signed by platform
    private String signatureAlgorithm;         // SHA256withRSA

    // Metadata
    private Map<String, Object> interviewMetadata; // interview details
    private String badgeImageUrl;              // skill badge image

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDetail {
        private String skill;
        private Double score;
        private String evidence;               // what proved this skill
        private String assessmentMethod;       // CODING, Q_AND_A, SYSTEM_DESIGN, PROJECT_REVIEW
    }
}
