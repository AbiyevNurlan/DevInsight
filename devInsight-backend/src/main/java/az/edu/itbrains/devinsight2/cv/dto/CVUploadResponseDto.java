package az.edu.itbrains.devinsight2.cv.dto;

import az.edu.itbrains.devinsight2.cv.enums.TextQuality;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVUploadResponseDto {
    private Boolean success;
    private String message;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private LocalDateTime uploadedDate;
    

    private Boolean textExtracted;
    private String cvTextPreview;
    private TextQuality textQuality;
    private String extractionError;
}
