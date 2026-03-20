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
public class LearningPathResponseDto {
    private String targetRole;
    private Integer totalDurationWeeks;
    private String difficultyLevel; // BEGINNER, INTERMEDIATE, ADVANCED
    
    private List<LearningPhase> phases;
    private List<CourseRecommendation> recommendedCourses;
    private List<String> milestones;
    private List<String> practiceProjects;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningPhase {
        private Integer phaseNumber;
        private String phaseName;
        private String description;
        private Integer durationWeeks;
        private List<String> skillsToCover;
        private List<String> objectives;
        private String outcome;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseRecommendation {
        private String courseName;
        private String platform; // Udemy, Coursera, edX, YouTube, FreeCodeCamp, etc.
        private String url;
        private String skillCovered;
        private Integer durationHours;
        private String difficulty;
        private String cost; // FREE, PAID, SUBSCRIPTION
        private Double rating; // 0-5
        private String description;
    }
}
