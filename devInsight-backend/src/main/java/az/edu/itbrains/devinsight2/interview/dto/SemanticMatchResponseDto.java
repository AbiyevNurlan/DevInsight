package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemanticMatchResponseDto {
    private Double semanticSimilarity; // 0-100
    private String matchQuality; // EXCELLENT, GOOD, FAIR, POOR
    
    private Map<String, Double> conceptMatches; // concept -> similarity score
    private Map<String, Double> skillRelevance; // skill -> relevance weight
    
    private String explanation;
    private String recommendation;
}
