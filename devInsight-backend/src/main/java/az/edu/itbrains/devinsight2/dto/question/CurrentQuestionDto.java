package az.edu.itbrains.devinsight2.dto.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentQuestionDto {
    private Long questionId;
    private Integer questionOrder;
    private String questionText;
    private String questionAudioUrl;
    private String difficulty;
    private String status;
}