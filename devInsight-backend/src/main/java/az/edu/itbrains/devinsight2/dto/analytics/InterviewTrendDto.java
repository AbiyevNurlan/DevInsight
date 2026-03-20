package az.edu.itbrains.devinsight2.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewTrendDto {
    private LocalDate date;
    private Long count;
}
