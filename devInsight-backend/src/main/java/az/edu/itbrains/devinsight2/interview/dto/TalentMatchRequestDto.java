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
public class TalentMatchRequestDto {
    private Long jobId;
    private String jobTitle;
    private String jobDescription;
    private List<String> requiredSkills;
    private String experienceLevel;
    private String location;
    private String timezone;
    private Boolean remoteAllowed;
    private String workArrangement; // REMOTE, HYBRID, ONSITE
    private String salaryRange;
    private List<String> languages;
    private String complianceRequirements; // GDPR, CCPA, etc.
}
