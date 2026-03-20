package az.edu.itbrains.devinsight2.dto.question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDetailDto {
    private String question;
    private String userAnswer;
    private Integer overallScore;
    private String feedback;
    private Integer relevanceScore;
    private Integer completenessScore;
    private Integer clarityScore;
    private Integer confidenceScore;

    public AnswerDetailDto(String question, String userAnswer,
                           Integer overallScore, String feedback) {
        this.question = question;
        this.userAnswer = userAnswer;
        this.overallScore = overallScore;
        this.feedback = feedback;
    }
}