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
public class CodeExecutionResponseDto {
    private String executionId;
    private String language;
    private String status;              // SUCCESS, COMPILATION_ERROR, RUNTIME_ERROR, TIMEOUT, MEMORY_EXCEEDED

    // Execution results
    private String stdout;
    private String stderr;
    private Integer exitCode;
    private Long executionTimeMs;
    private Long memoryUsedKb;

    // Test case results
    private Integer totalTests;
    private Integer passedTests;
    private Integer failedTests;
    private List<TestCaseResult> testResults;

    // Code quality metrics
    private CodeQualityMetrics codeQuality;

    // Security analysis
    private SecurityScanResult securityScan;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private Integer testNumber;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private Boolean passed;
        private Long executionTimeMs;
        private String errorMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodeQualityMetrics {
        private Double complexityCyclomaticScore;     // 0-100 (lower is better)
        private Integer linesOfCode;
        private Integer blankLines;
        private Integer commentLines;
        private Double commentRatio;                   // comments / total lines
        private Integer nestingDepth;
        private Integer functionCount;
        private Double maintainabilityIndex;           // 0-100
        private List<String> codeSmells;               // detected anti-patterns
        private Map<String, String> suggestions;       // improvement suggestions
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecurityScanResult {
        private Boolean safe;
        private List<String> blockedOperations;        // e.g., "file system access", "network calls"
        private List<String> warnings;
        private String riskLevel;                      // SAFE, LOW, MEDIUM, HIGH, CRITICAL
    }
}
