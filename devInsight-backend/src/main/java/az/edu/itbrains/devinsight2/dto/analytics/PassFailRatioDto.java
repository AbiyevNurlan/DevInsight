package az.edu.itbrains.devinsight2.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassFailRatioDto {
    private Long passed;
    private Long failed;
    private Long pending;
}
