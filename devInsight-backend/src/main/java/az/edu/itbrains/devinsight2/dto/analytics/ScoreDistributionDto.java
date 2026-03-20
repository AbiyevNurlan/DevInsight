package az.edu.itbrains.devinsight2.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreDistributionDto {
    private String scoreRange;
    private Long count;
}
