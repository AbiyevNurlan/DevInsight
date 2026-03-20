package az.edu.itbrains.devinsight2.dto.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationReportDto {
    @NotNull
    private Long interviewId;
    
    @NotNull
    private String type;
    
    @NotNull
    private String details;
    
    private String severity;
    private String screenshotData; // Base64 encoded screenshot
    private Long videoTimestamp;
    private String browserInfo;
}
