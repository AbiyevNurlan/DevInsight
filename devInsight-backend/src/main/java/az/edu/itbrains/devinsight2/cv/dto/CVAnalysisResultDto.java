package az.edu.itbrains.devinsight2.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for CV analysis results from Claude API
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVAnalysisResultDto {
    private List<String> skills;
    private String experienceLevel; // JUNIOR, MID, SENIOR
    private List<String> categories;
    private Integer yearsOfExperience;
    private String education;
    private List<String> languages;
    private String summary;
}
