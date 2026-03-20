package az.edu.itbrains.devinsight2.dto.template;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateStatisticsDto {
    private Long templateId;
    private String templateName;
    private Integer usageCount;
    private LocalDateTime lastUsedDate;
    private Double averageScore;
    private Long totalCandidates;
}
