package az.edu.itbrains.devinsight2.dto.submission;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionDto {
    private Long id;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    @NotNull(message = "Interview ID is required")
    private Long interviewId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Answer text cannot be blank")
    @Size(max = 5000, message = "Answer text cannot exceed 5000 characters")
    private String answerText;

    @NotNull(message = "Submission time is required")
    private LocalDateTime submittedAt;

    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    // Optional fields
    private String codeSubmission;
    private String textAnswer;
    private String videoUrl;
    private String status;
    private LocalDateTime startedAt;
    private Integer timeSpentSeconds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}