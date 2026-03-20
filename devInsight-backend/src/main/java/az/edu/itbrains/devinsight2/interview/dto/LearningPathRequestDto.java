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
public class LearningPathRequestDto {
    private Long candidateId;
    private String targetRole;
    private List<String> skillGaps;
    private String learningStyle; // VISUAL, AUDITORY, READING, KINESTHETIC, MIXED
    private Integer availableHoursPerWeek;
    private String budget; // FREE, LOW, MODERATE, HIGH
}
