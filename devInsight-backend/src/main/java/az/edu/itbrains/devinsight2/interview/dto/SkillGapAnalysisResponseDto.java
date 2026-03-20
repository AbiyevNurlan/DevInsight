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
public class SkillGapAnalysisResponseDto {
    private String targetRole;
    private String experienceLevel;
    
    // Current State
    private List<String> currentSkills;
    private Integer currentSkillCount;
    
    // Required State
    private List<String> requiredSkills;
    private Integer requiredSkillCount;
    
    // Gap Analysis
    private List<SkillGap> skillGaps;
    private List<String> missingCriticalSkills;
    private List<String> partialSkills; // Has basic knowledge but needs improvement
    private List<String> strongSkills; // Already proficient
    
    // Metrics
    private Double overallReadiness; // 0-100%
    private Integer estimatedLearningMonths;
    private String readinessLevel; // READY, NEARLY_READY, NEEDS_DEVELOPMENT, SIGNIFICANT_GAP
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGap {
        private String skillName;
        private String category; // TECHNICAL, SOFT_SKILL, TOOL, FRAMEWORK
        private String priority; // CRITICAL, HIGH, MEDIUM, LOW
        private String currentLevel; // NONE, BASIC, INTERMEDIATE, ADVANCED
        private String requiredLevel; // BASIC, INTERMEDIATE, ADVANCED, EXPERT
        private Integer estimatedLearningWeeks;
        private String difficulty; // EASY, MODERATE, HARD, VERY_HARD
    }
}
