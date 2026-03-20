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
public class UpskillingRecommendationDto {
    private Long candidateId;
    private String candidateName;
    private String currentRole;
    private String targetRole;
    
    // Overall Assessment
    private Double readinessScore; // 0-100
    private String readinessLevel;
    private Integer estimatedMonthsToReady;
    
    // Skill Gaps
    private List<String> criticalGaps;
    private List<String> importantGaps;
    private List<String> niceToHaveGaps;
    
    // Learning Recommendations
    private String recommendedLearningPath;
    private List<String> prioritizedSkills;
    private List<String> quickWins; // Skills that are easy to learn and high impact
    
    // Action Plan
    private List<ActionItem> immediateActions;
    private List<ActionItem> shortTermActions; // 1-3 months
    private List<ActionItem> longTermActions; // 3-12 months
    
    // Resources
    private List<String> recommendedCourses;
    private List<String> books;
    private List<String> practiceProjects;
    private List<String> certifications;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionItem {
        private String action;
        private String skill;
        private Integer priority; // 1-10
        private Integer estimatedWeeks;
        private String expectedOutcome;
    }
}
