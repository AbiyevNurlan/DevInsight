package az.edu.itbrains.devinsight2.dto.question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponseDto {
    private Boolean success;
    private String message;
    private String sessionToken;
}
