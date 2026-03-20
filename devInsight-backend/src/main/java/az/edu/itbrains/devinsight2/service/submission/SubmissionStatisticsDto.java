package az.edu.itbrains.devinsight2.service.submission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionStatisticsDto {
    private Integer totalSubmissions;
    private Double averageScore;
    private Double highestScore;
    private Double lowestScore;
}
