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
public class InterviewArtifactsDto {
    private Long candidateId;
    private String candidateName;
    
    // All AI-generated artifacts in one place
    private CVAnalysisArtifact cvAnalysis;
    private List<QuestionAnswerArtifact> questionAnswers;
    private BehavioralArtifact behavioral;
    private ScoringArtifact scoring;
    private ExplainabilityArtifact explainability;
    private MatchingArtifact matching;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CVAnalysisArtifact {
        private List<String> skills;
        private String experienceLevel;
        private Integer yearsOfExperience;
        private String summary;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionAnswerArtifact {
        private String question;
        private String answer;
        private Integer score;
        private String feedback;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BehavioralArtifact {
        private String sentiment;
        private Integer confidenceLevel;
        private Integer communicationScore;
        private String recommendation;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoringArtifact {
        private Integer totalScore;
        private Integer maxScore;
        private Double percentage;
        private String recommendation;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExplainabilityArtifact {
        private String explanation;
        private List<String> topFactors;
        private Double confidence;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchingArtifact {
        private Double matchScore;
        private String matchCategory;
        private List<String> strengths;
        private List<String> concerns;
    }
}
