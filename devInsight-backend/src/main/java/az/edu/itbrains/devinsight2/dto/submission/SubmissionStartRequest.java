package az.edu.itbrains.devinsight2.dto.submission;

import lombok.Data;
import java.util.List;

@Data
public class SubmissionStartRequest {
    private Long interviewId;
    private List<AnswerDto> answers;
    
    @Data
    public static class AnswerDto {
        private Integer questionId;  // Changed to Integer to match Question entity
        private String answer;
    }
}
