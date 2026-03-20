package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamChemistryRequestDto {
    private Long candidateId;
    private Long interviewId;

    // Candidate profile from interview
    private String communicationStyle;    // DIRECT, COLLABORATIVE, ANALYTICAL, EXPRESSIVE
    private String workPreference;        // INDEPENDENT, PAIR, TEAM, FLEXIBLE
    private String conflictResolution;    // AVOID, ACCOMMODATE, COMPETE, COMPROMISE, COLLABORATE
    private String decisionMaking;        // DATA_DRIVEN, INTUITIVE, CONSENSUS, DIRECTIVE
    private List<String> values;          // e.g., ["innovation", "stability", "growth"]
    private String leadershipStyle;       // SERVANT, VISIONARY, COACH, DEMOCRATIC
    private Double extroversionLevel;     // 0-1

    // Team profile
    private String teamName;
    private Integer teamSize;
    private List<TeamMemberProfile> existingMembers;
    private String teamCulture;           // STARTUP, CORPORATE, HYBRID, AGILE
    private String projectType;           // GREENFIELD, MAINTENANCE, MIGRATION, RESEARCH

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberProfile {
        private String role;
        private String communicationStyle;
        private String workPreference;
        private Double satisfactionLevel;  // current team satisfaction 0-10
    }
}
