package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillCertificateRequestDto {
    @NotNull
    private Long candidateId;
    @NotNull
    private Long interviewId;

    private String skillName;                  // e.g., "Advanced Java", "System Design"
    private String proficiencyLevel;           // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    private Double verifiedScore;              // 0-100
    private List<String> verifiedSkills;       // individual skills verified
    private String issuedBy;                   // "DevInsight AI" or company name
    private Integer validityMonths;            // certificate validity (default 12)
    private Boolean publiclyVerifiable;        // can external parties verify
}
