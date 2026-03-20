package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemanticMatchRequestDto {
    private String jobDescription;
    private String candidateProfile;
    private String candidateCV;
    private Boolean includeSkillWeighting;
}
