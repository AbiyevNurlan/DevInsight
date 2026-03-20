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
public class CandidateShortlistDto {
    private Long candidateId;
    private String candidateName;
    private String email;
    private Integer totalScore;
    private Integer maxPossibleScore;
    private Double overallPercentage;
    private String experienceLevel;
    private List<String> skills;
    private Integer technicalScore;
    private Integer behavioralScore;
    private Integer situationalScore;
    private String recommendation; // STRONG_YES, YES, MAYBE, NO
    private List<String> strengths;
    private List<String> concerns;
    private Integer rank;
}
