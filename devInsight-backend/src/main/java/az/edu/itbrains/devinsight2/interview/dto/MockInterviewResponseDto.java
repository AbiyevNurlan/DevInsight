package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockInterviewResponseDto {
    private String sessionId;
    private String status;                // IN_PROGRESS, COMPLETED, ABANDONED
    private String jobTitle;
    private String difficulty;

    // Current question
    private MockQuestion currentQuestion;
    private Integer currentQuestionNumber;
    private Integer totalQuestions;

    // Session progress
    private List<CompletedQuestion> completedQuestions;
    private Double overallScore;          // 0-100
    private String performanceLevel;      // EXCEPTIONAL, STRONG, GOOD, NEEDS_IMPROVEMENT, WEAK

    // AI Coach feedback
    private CoachFeedback coachFeedback;

    // Performance breakdown
    private Map<String, Double> skillScores;      // e.g., {"problem-solving": 85, "communication": 72}
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> improvementSuggestions;

    // Comparison
    private PerformanceBenchmark benchmark;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MockQuestion {
        private Integer number;
        private String question;
        private String type;                      // TECHNICAL, BEHAVIORAL, CODING, SYSTEM_DESIGN
        private String difficulty;
        private String topic;
        private List<String> hints;               // progressive hints
        private Integer timeLimitSeconds;
        private String codingTemplate;            // starter code for coding questions
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletedQuestion {
        private Integer number;
        private String question;
        private String candidateAnswer;
        private Double score;
        private String feedback;
        private String idealAnswer;               // revealed after answering
        private List<String> keyPointsMissed;
        private List<String> keyPointsHit;
        private String followUpAdvice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoachFeedback {
        private String overallAssessment;
        private String communicationFeedback;
        private String technicalDepthFeedback;
        private String problemSolvingFeedback;
        private String bodyLanguageTips;          // if video analysis is available
        private List<String> practiceRecommendations;
        private String nextStepAdvice;
        private String motivationalMessage;
        private Map<String, String> resourceLinks; // learning resources per weak area
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceBenchmark {
        private Double percentileRank;            // among all mock interviewees
        private Double averageScoreForRole;
        private Double candidateScoreVsAverage;   // diff from avg
        private String readinessLevel;            // READY, ALMOST_READY, NEEDS_MORE_PRACTICE
        private Integer estimatedRealInterviewScore; // predicted real score
    }
}
