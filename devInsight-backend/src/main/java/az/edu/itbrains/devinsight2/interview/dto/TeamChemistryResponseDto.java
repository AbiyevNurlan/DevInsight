package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamChemistryResponseDto {
    private Double chemistryScore;            // 0-100
    private String compatibilityLevel;         // EXCELLENT, GOOD, MODERATE, LOW, RISKY
    private Double cultureFitScore;           // 0-100
    private Double collaborationPotential;    // 0-100

    // Role dynamics
    private String predictedTeamRole;         // LEADER, MEDIATOR, INNOVATOR, EXECUTOR, ANALYST
    private Double roleGapFitScore;           // how well they fill team gaps
    private List<String> teamGapsTheyFill;
    private List<String> potentialOverlaps;   // roles already covered

    // Interaction predictions
    private List<InteractionPrediction> interactions;

    // Risk analysis
    private List<String> potentialFrictions;
    private List<String> synergyOpportunities;
    private Double conflictRisk;              // 0-100
    private Double teamProductivityImpact;    // -20 to +30 (% impact on team output)

    // Personality map
    private Map<String, Double> personalityDimensions; // {openness, conscientiousness, ...}

    // AI insights
    private String summary;
    private List<String> onboardingTips;
    private String managementAdvice;
    private String teamDynamicsImpact;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InteractionPrediction {
        private String memberRole;
        private Double compatibilityScore;    // 0-100
        private String interactionType;        // COMPLEMENTARY, NEUTRAL, POTENTIAL_FRICTION
        private String advice;
    }
}
