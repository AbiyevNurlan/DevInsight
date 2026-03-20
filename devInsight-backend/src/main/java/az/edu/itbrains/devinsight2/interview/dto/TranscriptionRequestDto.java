package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptionRequestDto {
    private String audioUrl;
    private String videoUrl;
    private String language; // en, az, tr, ru
    private Boolean includeTimestamps;
    private Boolean includeSpeakerLabels;
}
