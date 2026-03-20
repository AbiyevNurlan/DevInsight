package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewReportResponseDto {
    private String reportId;
    private Long interviewId;
    private Long candidateId;
    private String reportType;
    private LocalDateTime generatedAt;

    // Candidate overview
    private CandidateOverview candidateOverview;

    // Score breakdown
    private ScoreBreakdown scoreBreakdown;

    // Technical analysis
    private TechnicalAnalysis technicalAnalysis;

    // Behavioral analysis
    private BehavioralInsights behavioralInsights;

    // Security & integrity
    private IntegrityReport integrityReport;

    // AI-powered insights
    private AIInsights aiInsights;

    // Comparison (if requested)
    private CandidateComparison comparison;

    // Hiring recommendation
    private HiringRecommendation hiringRecommendation;

    // Report metadata
    private String htmlContent;                // rendered HTML report
    private String downloadUrl;                // PDF download URL

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateOverview {
        private String name;
        private String email;
        private String appliedPosition;
        private String interviewDate;
        private Integer totalQuestions;
        private Integer answered;
        private Long timeTakenMinutes;
        private String overallGrade;           // A+, A, B+, B, C+, C, D, F
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreBreakdown {
        private Double overallScore;           // 0-100
        private Map<String, Double> categoryScores;  // e.g., {"java": 85, "sql": 70, "design": 90}
        private Map<String, Double> competencyScores; // e.g., {"problem-solving": 80, "communication": 75}
        private List<QuestionScore> questionScores;
        private Double percentileRank;         // compared to all candidates for this position
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionScore {
        private Integer questionNumber;
        private String question;
        private String topic;
        private Double score;
        private String grade;
        private String feedback;
        private List<String> strengths;
        private List<String> weaknesses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicalAnalysis {
        private Map<String, Double> skillProficiency;  // skill -> mastery level
        private List<String> demonstratedSkills;
        private List<String> missingSkills;
        private Double codeQualityAverage;
        private Map<String, String> codeAnalysis;      // question -> code review
        private String architecturalThinking;
        private String problemSolvingApproach;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BehavioralInsights {
        private Double communicationScore;
        private Double responseConsistency;
        private Double stressHandling;
        private String communicationStyle;
        private List<String> positiveTraits;
        private List<String> concerns;
        private Double engagementLevel;
        private Map<String, Double> emotionalProfile; // emotion -> percentage
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IntegrityReport {
        private Boolean flagged;
        private Integer totalViolations;
        private Integer criticalViolations;
        private List<String> violationSummary;
        private Double integrityScore;         // 0-100
        private String trustLevel;             // HIGH, MEDIUM, LOW, COMPROMISED
        private Boolean aiContentDetected;
        private Boolean suspiciousBehavior;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIInsights {
        private String executiveSummary;
        private List<String> keyStrengths;
        private List<String> developmentAreas;
        private String growthPotential;
        private String roleReadiness;          // READY, PROMISING, NEEDS_DEVELOPMENT, NOT_READY
        private String cultureFitAssessment;
        private List<String> interviewHighlights;
        private String uniqueQualities;
        private Double confidenceInAssessment; // 0-100
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateComparison {
        private String comparedCandidateName;
        private Map<String, Double[]> scoreComparison; // category -> [candidate1, candidate2]
        private String betterCandidate;
        private List<String> candidate1Advantages;
        private List<String> candidate2Advantages;
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HiringRecommendation {
        private String decision;               // STRONG_HIRE, HIRE, LEAN_HIRE, LEAN_NO_HIRE, NO_HIRE, STRONG_NO_HIRE
        private Double confidence;             // 0-100
        private String justification;
        private List<String> prosForHiring;
        private List<String> consForHiring;
        private String suggestedRole;          // if different from applied
        private String suggestedLevel;         // if different from expected
        private Double salaryRecommendation;
        private String nextSteps;
    }
}
