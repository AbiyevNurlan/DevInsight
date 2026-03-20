package az.edu.itbrains.devinsight2.dto.candidate;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating candidate status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCandidateStatusDto {
    
    @NotBlank(message = "Status is required")
    private String status; // SCHEDULED, INTERVIEWED, PASSED, FAILED, NEW
    
    private String notes;
}
