package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiasDetectionRequestDto {
    private Long interviewId;
    private List<QuestionAsked> questionsAsked;
    private List<CandidateScore> candidateScores;
    private Map<String, Object> interviewerProfile;
    private String positionTitle;
    private String department;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionAsked {
        private String question;
        private String questionType;
        private Integer difficultyLevel;
        private String candidateId;
        private String candidateGender;  // anonymized category
        private String candidateBackground;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateScore {
        private String candidateId;
        private Integer technicalScore;
        private Integer communicationScore;
        private Integer overallScore;
        private String decision;  // PASS, FAIL, PENDING
        private String interviewerNotes;
    }
}
