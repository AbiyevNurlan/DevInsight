package az.edu.itbrains.devinsight2.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelSessionRequestDto {
    private String sessionToken;
    private String reason;
}