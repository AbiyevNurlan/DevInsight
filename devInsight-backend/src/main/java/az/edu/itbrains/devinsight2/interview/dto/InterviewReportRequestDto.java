package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewReportRequestDto {
    @NotNull
    private Long interviewId;
    @NotNull
    private Long candidateId;

    private String reportType;                 // FULL, SUMMARY, TECHNICAL_ONLY, BEHAVIORAL_ONLY, EXECUTIVE
    private String format;                     // PDF, HTML, JSON
    private String language;                   // "en", "az", "tr"
    private Boolean includeScoreBreakdown;
    private Boolean includeAIExplanations;
    private Boolean includeCodeAnalysis;
    private Boolean includeSecurityViolations;
    private Boolean includeComparisonWithOthers;
    private Boolean includeHiringRecommendation;
    private List<String> customSections;       // additional sections to include
    private Long comparedWithCandidateId;      // optional comparison candidate
}
