package az.edu.itbrains.devinsight2.dto.question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerSubmissionDto {
    private String sessionToken;
    private String audioUrl;
    private Long durationSeconds;
}