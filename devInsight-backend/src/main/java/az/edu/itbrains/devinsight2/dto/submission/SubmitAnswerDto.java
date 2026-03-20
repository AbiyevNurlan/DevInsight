package az.edu.itbrains.devinsight2.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitAnswerDto {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotBlank(message = "Answer cannot be blank")
    private String answer;
}
