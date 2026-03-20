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
public class CodeOriginalityResponseDto {
    private Double originalityScore;          // 0-100 (100 = completely original)
    private String verdict;                    // ORIGINAL, LIKELY_MEMORIZED, SUSPICIOUS, AI_GENERATED
    private Double plagiarismRisk;             // 0-100

    // Writing pattern analysis
    private String writingPattern;             // ORGANIC, LINEAR, BULK_PASTE, ITERATIVE
    private Double typingConsistency;          // 0-100
    private Boolean hasNaturalProgressions;    // did they build solution incrementally?
    private Integer suspiciousPasteEvents;

    // Code style analysis
    private String codeStyleAssessment;        // UNIQUE, COMMON_PATTERN, TEXTBOOK, LEETCODE_TEMPLATE
    private List<String> styleIndicators;
    private Double variableNamingOriginality;  // 0-100
    private Boolean usesUncommonApproach;

    // Problem-solving signals
    private Boolean hadDebuggingPhase;         // natural debugging = more authentic
    private Boolean showedIterativeThinking;
    private Integer refactorCount;
    private Double solutionComplexityMatch;    // does complexity match candidate's stated level?

    // Similarity analysis
    private List<SimilarSolution> similarSolutions;

    // AI insights
    private String detailedAnalysis;
    private List<String> redFlags;
    private List<String> authenticitySignals;
    private Map<String, Double> confidenceBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimilarSolution {
        private String source;          // "LeetCode Common", "GeeksForGeeks Pattern", etc.
        private Double similarityScore; // 0-1
        private String matchType;       // STRUCTURE, VARIABLE_NAMES, ALGORITHM, EXACT
    }
}
