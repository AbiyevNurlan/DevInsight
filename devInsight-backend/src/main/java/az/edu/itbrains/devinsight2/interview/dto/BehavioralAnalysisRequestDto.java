package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralAnalysisRequestDto {
    private String candidateAnswer;
    private String videoTranscript;
    private String audioMetadata; // tone, pace, pauses
    private String questionType; // TECHNICAL, BEHAVIORAL, SITUATIONAL
    private Integer currentDifficulty; // 1-10
}
