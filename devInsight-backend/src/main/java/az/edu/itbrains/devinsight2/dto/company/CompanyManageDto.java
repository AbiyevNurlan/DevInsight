package az.edu.itbrains.devinsight2.dto.company;

import az.edu.itbrains.devinsight2.model.company.CompanySize;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyManageDto {
    private Long id;

    @NotBlank(message = "Company name is required")
    private String name;

    private String domain;
    private String description;
    private String industry;
    private String website;
    private String logoUrl;
    private CompanySize size;
    private Integer employeeCount;
    private Integer interviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
