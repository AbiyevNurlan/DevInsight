package az.edu.itbrains.devinsight2.dto.interview;

import az.edu.itbrains.devinsight2.model.interview.InterviewLevel;
import az.edu.itbrains.devinsight2.model.interview.InterviewStatus;
import az.edu.itbrains.devinsight2.model.interview.InterviewType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewManageDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Level is required")
    private InterviewLevel level;

    @NotNull(message = "Type is required")
    private InterviewType type;

    private Integer durationMinutes;
    private Long companyId;
    private String companyName;
    private Long createdById;
    private String createdByName;
    private InterviewStatus status;
    private Boolean isPublic;
    private Integer passingScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
