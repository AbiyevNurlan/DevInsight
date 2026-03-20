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
public class MockInterviewRequestDto {
    @NotNull
    private Long candidateId;

    private String jobTitle;              // e.g., "Senior Java Developer"
    private String difficulty;            // JUNIOR, MID, SENIOR, LEAD, PRINCIPAL
    private String domain;                // BACKEND, FRONTEND, FULLSTACK, DATA, DEVOPS, MOBILE, ML
    private List<String> technologies;    // e.g., ["Java", "Spring Boot", "PostgreSQL"]
    private String interviewType;         // TECHNICAL, BEHAVIORAL, SYSTEM_DESIGN, CODING, MIXED
    private Integer questionCount;        // default 5
    private Integer timeLimitMinutes;     // default 45
    private String language;              // interview language: "en", "az", "tr", "ru"

    // Adaptive settings
    private Boolean adaptiveDifficulty;   // adjust based on answers
    private String focusArea;             // specific topic to focus on
    private String previousPerformance;   // summary of past interview results
}
