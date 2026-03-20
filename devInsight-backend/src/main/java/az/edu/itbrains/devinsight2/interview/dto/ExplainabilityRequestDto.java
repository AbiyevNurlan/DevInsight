package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplainabilityRequestDto {
    private Long candidateId;
    private String decisionType; // SCORING, SHORTLIST, BEHAVIORAL, QUESTION_GENERATION
    private Object decisionData; // The actual decision/score that needs explanation
}
