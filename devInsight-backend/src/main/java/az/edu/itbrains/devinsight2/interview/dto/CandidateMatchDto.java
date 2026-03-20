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
public class CandidateMatchDto {
    private Long candidateId;
    private String candidateName;
    private String email;
    
    // Match Scores
    private Double overallMatchScore; // 0-100
    private Double skillMatchScore; // 0-100
    private Double experienceMatchScore; // 0-100
    private Double locationMatchScore; // 0-100
    private Double culturalFitScore; // 0-100
    private Double availabilityScore; // 0-100
    
    // Location Intelligence
    private String currentLocation;
    private String timezone;
    private Integer timezoneOffset; // hours difference
    private Boolean willingToRelocate;
    private Boolean remotePreference;
    private String workArrangementPreference;
    
    // Skills Analysis
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private List<String> bonusSkills;
    private Integer skillMatchPercentage;
    
    // Experience
    private String experienceLevel;
    private Integer yearsOfExperience;
    private List<String> previousRoles;
    
    // Compliance
    private Boolean gdprCompliant;
    private Boolean workAuthorizationValid;
    private List<String> certifications;
    
    // Ranking
    private Integer rank;
    private String matchCategory; // EXCELLENT, GOOD, FAIR, POOR
    private String recommendation;
    private List<String> strengths;
    private List<String> concerns;
}
