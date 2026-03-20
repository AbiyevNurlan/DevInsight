package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionRequestDto {
    @NotNull
    private Long interviewId;
    private Long candidateId;

    @NotBlank
    private String language;          // JAVA, PYTHON, JAVASCRIPT, CPP, CSHARP, GO, RUST, KOTLIN, RUBY, PHP, SWIFT, TYPESCRIPT, SCALA, R, SQL

    @NotBlank
    private String sourceCode;

    private String stdin;             // Standard input for the program
    private Integer timeoutSeconds;   // Max execution time (default 10s, max 30s)
    private Integer memoryLimitMb;    // Max memory (default 256MB)
    private List<String> testCases;   // Optional test inputs
    private List<String> expectedOutputs; // Expected outputs for test cases
    private String questionId;        // Link to interview question
}
