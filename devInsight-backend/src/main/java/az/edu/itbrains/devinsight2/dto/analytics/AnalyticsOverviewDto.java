package az.edu.itbrains.devinsight2.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewDto {
    private Long totalInterviews;
    private Double completionRate;
    private Double averageScore;
    private Double passRate;
}
