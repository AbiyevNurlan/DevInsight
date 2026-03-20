package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapAnalysisRequestDto {
    private Long candidateId;
    private String targetRole;
    private String experienceLevel; // JUNIOR, MID, SENIOR
    private List<String> currentSkills;
    private Integer yearsOfExperience;
}
