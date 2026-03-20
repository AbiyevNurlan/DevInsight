package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultimodalAnalysisDto {
    // Text Analysis
    private Integer textQualityScore; // 0-100
    private String textClarity;
    private String textDepth;
    
    // Voice Analysis
    private Integer voiceQualityScore; // 0-100
    private String communicationSkill;
    private String confidence;
    private String emotionalState;
    
    // Video Analysis
    private Integer videoQualityScore; // 0-100
    private String nonverbalCommunication;
    private String professionalism;
    private String engagement;
    
    // Combined Analysis
    private Integer overallScore; // 0-100
    private String consistency; // Are text, voice, video aligned?
    private String authenticity; // Does candidate seem genuine?
    private String recommendation;
    private String detailedFeedback;
}
