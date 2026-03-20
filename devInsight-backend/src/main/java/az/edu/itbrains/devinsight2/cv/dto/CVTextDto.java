package az.edu.itbrains.devinsight2.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for returning full CV text content
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVTextDto {
    private String text;
    private String quality; // LOW, MEDIUM, HIGH
    private Integer wordCount;
}
