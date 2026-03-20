package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidatePotentialRequestDto {
    private Long candidateId;
    private Long interviewId;
    private List<QuestionPerformance> performances;
    private String currentRole;
    private Integer yearsExperience;
    private List<String> currentSkills;
    private String educationLevel;
    private String targetPosition;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionPerformance {
        private String questionType;
        private Integer difficulty;         // 1-10
        private Integer score;              // 0-100
        private Integer timeTakenSeconds;
        private Boolean usedHints;
        private Integer hintCount;
        private Boolean improvedAfterHint;  // key signal: learning speed
        private String approach;            // how they tackled the problem
    }
}
