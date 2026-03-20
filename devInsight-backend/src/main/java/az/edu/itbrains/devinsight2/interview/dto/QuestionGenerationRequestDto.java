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
public class QuestionGenerationRequestDto {
    private String role;
    private String experienceLevel; // JUNIOR, MID, SENIOR
    private List<String> skills;
    private Integer questionCount;
    private String difficulty; // EASY, MEDIUM, HARD
}
