package az.edu.itbrains.devinsight2.dto.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PingDto {
    private Long clientTimestamp;
    private Long serverTimestamp;
}