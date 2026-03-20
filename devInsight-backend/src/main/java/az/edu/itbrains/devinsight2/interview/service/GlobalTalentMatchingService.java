package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.CandidateMatchDto;
import az.edu.itbrains.devinsight2.interview.dto.TalentMatchRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.TalentMatchResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class GlobalTalentMatchingService {
    
    // Semantic matching service - reserved for future use
    // private final SemanticMatchingService semanticMatchingService;
    
    /**
     * Find and rank global talent matches
     */
    public TalentMatchResponseDto findTalentMatches(
            TalentMatchRequestDto request, List<CandidateMatchDto> candidates) {
        
        log.info("Finding talent matches for job: {}", request.getJobTitle());
        
        // Calculate match scores
        List<CandidateMatchDto> scoredCandidates = candidates.stream()
            .map(candidate -> calculateMatchScores(candidate, request))
            .sorted(Comparator.comparingDouble(CandidateMatchDto::getOverallMatchScore).reversed())
            .collect(Collectors.toList());
        
        // Assign ranks
        for (int i = 0; i < scoredCandidates.size(); i++) {
            scoredCandidates.get(i).setRank(i + 1);
        }
        
        // Categorize matches
        List<CandidateMatchDto> topMatches = scoredCandidates.stream()
            .filter(c -> c.getOverallMatchScore() >= 80)
            .collect(Collectors.toList());
        
        List<CandidateMatchDto> goodMatches = scoredCandidates.stream()
            .filter(c -> c.getOverallMatchScore() >= 60 && c.getOverallMatchScore() < 80)
            .collect(Collectors.toList());
        
        List<CandidateMatchDto> potentialMatches = scoredCandidates.stream()
            .filter(c -> c.getOverallMatchScore() >= 40 && c.getOverallMatchScore() < 60)
            .collect(Collectors.toList());
        
        // Analyze distributions
        TalentMatchResponseDto.LocationDistribution locationDist = 
            analyzeLocationDistribution(scoredCandidates, request);
        
        List<TalentMatchResponseDto.TimezoneGroup> timezoneGroups = 
            analyzeTimezoneDistribution(scoredCandidates, request);
        
        // Generate insights
        String marketInsight = generateMarketInsight(scoredCandidates, request);
        List<String> recommendations = generateRecommendations(scoredCandidates, request);
        
        Double avgScore = scoredCandidates.stream()
            .mapToDouble(CandidateMatchDto::getOverallMatchScore)
            .average()
            .orElse(0.0);
        
        return TalentMatchResponseDto.builder()
            .jobId(request.getJobId())
            .jobTitle(request.getJobTitle())
            .totalCandidates(candidates.size())
            .matchedCandidates(scoredCandidates.size())
            .topMatches(topMatches)
            .goodMatches(goodMatches)
            .potentialMatches(potentialMatches)
            .locationDistribution(locationDist)
            .timezoneGroups(timezoneGroups)
            .marketInsight(marketInsight)
            .recommendations(recommendations)
            .averageMatchScore(avgScore)
            .build();
    }
    
    /**
     * Calculate comprehensive match scores
     */
    private CandidateMatchDto calculateMatchScores(
            CandidateMatchDto candidate, TalentMatchRequestDto request) {
        
        // Skill Match Score
        Double skillScore = calculateSkillMatch(candidate, request);
        candidate.setSkillMatchScore(skillScore);
        
        // Experience Match Score
        Double experienceScore = calculateExperienceMatch(candidate, request);
        candidate.setExperienceMatchScore(experienceScore);
        
        // Location Match Score
        Double locationScore = calculateLocationMatch(candidate, request);
        candidate.setLocationMatchScore(locationScore);
        
        // Cultural Fit Score (simulated - would use behavioral analysis in production)
        Double culturalScore = 75.0;
        candidate.setCulturalFitScore(culturalScore);
        
        // Availability Score
        Double availabilityScore = calculateAvailabilityScore(candidate, request);
        candidate.setAvailabilityScore(availabilityScore);
        
        // Overall Score (weighted average)
        Double overallScore = (
            skillScore * 0.35 +
            experienceScore * 0.25 +
            locationScore * 0.15 +
            culturalScore * 0.15 +
            availabilityScore * 0.10
        );
        candidate.setOverallMatchScore(overallScore);
        
        // Match Category
        if (overallScore >= 80) {
            candidate.setMatchCategory("EXCELLENT");
            candidate.setRecommendation("Highly recommended - proceed to interview");
        } else if (overallScore >= 60) {
            candidate.setMatchCategory("GOOD");
            candidate.setRecommendation("Good fit - consider for interview");
        } else if (overallScore >= 40) {
            candidate.setMatchCategory("FAIR");
            candidate.setRecommendation("Potential fit - review carefully");
        } else {
            candidate.setMatchCategory("POOR");
            candidate.setRecommendation("Not recommended for this position");
        }
        
        return candidate;
    }
    
    private Double calculateSkillMatch(CandidateMatchDto candidate, TalentMatchRequestDto request) {
        if (request.getRequiredSkills() == null || request.getRequiredSkills().isEmpty()) {
            return 100.0;
        }
        
        int matchingCount = (int) request.getRequiredSkills().stream()
            .filter(skill -> candidate.getMatchingSkills() != null && 
                           candidate.getMatchingSkills().contains(skill))
            .count();
        
        return (matchingCount * 100.0) / request.getRequiredSkills().size();
    }
    
    private Double calculateExperienceMatch(CandidateMatchDto candidate, TalentMatchRequestDto request) {
        if (request.getExperienceLevel() == null) {
            return 100.0;
        }
        
        Map<String, Integer> levelMap = Map.of(
            "JUNIOR", 1,
            "MID", 2,
            "SENIOR", 3,
            "LEAD", 4
        );
        
        Integer requiredLevel = levelMap.getOrDefault(request.getExperienceLevel(), 2);
        Integer candidateLevel = levelMap.getOrDefault(candidate.getExperienceLevel(), 2);
        
        int diff = Math.abs(requiredLevel - candidateLevel);
        return (double) Math.max(0, 100 - (diff * 25));
    }
    
    private Double calculateLocationMatch(CandidateMatchDto candidate, TalentMatchRequestDto request) {
        if (Boolean.TRUE.equals(request.getRemoteAllowed())) {
            // Remote work - timezone matters more
            int timezoneOffset = Math.abs(candidate.getTimezoneOffset() != null ? candidate.getTimezoneOffset() : 0);
            return (double) Math.max(0, 100 - (timezoneOffset * 10));
        } else {
            // Onsite/Hybrid - location proximity matters
            if (candidate.getCurrentLocation() != null && 
                request.getLocation() != null &&
                candidate.getCurrentLocation().equalsIgnoreCase(request.getLocation())) {
                return 100.0;
            } else if (Boolean.TRUE.equals(candidate.getWillingToRelocate())) {
                return 70.0;
            } else {
                return 30.0;
            }
        }
    }
    
    private Double calculateAvailabilityScore(CandidateMatchDto candidate, TalentMatchRequestDto request) {
        // Simplified availability calculation
        // In production, this would check actual availability dates
        return 85.0;
    }
    
    private TalentMatchResponseDto.LocationDistribution analyzeLocationDistribution(
            List<CandidateMatchDto> candidates, TalentMatchRequestDto request) {
        
        int local = 0, regional = 0, international = 0, remote = 0;
        
        for (CandidateMatchDto candidate : candidates) {
            if (Boolean.TRUE.equals(candidate.getRemotePreference())) {
                remote++;
            } else if (candidate.getCurrentLocation() != null && 
                      request.getLocation() != null &&
                      candidate.getCurrentLocation().equalsIgnoreCase(request.getLocation())) {
                local++;
            } else {
                // Simplified: assume same country = regional, different = international
                international++;
            }
        }
        
        return TalentMatchResponseDto.LocationDistribution.builder()
            .localCandidates(local)
            .regionalCandidates(regional)
            .internationalCandidates(international)
            .remoteCandidates(remote)
            .build();
    }
    
    private List<TalentMatchResponseDto.TimezoneGroup> analyzeTimezoneDistribution(
            List<CandidateMatchDto> candidates, TalentMatchRequestDto request) {
        
        Map<String, List<CandidateMatchDto>> timezoneMap = candidates.stream()
            .filter(c -> c.getTimezone() != null)
            .collect(Collectors.groupingBy(CandidateMatchDto::getTimezone));
        
        return timezoneMap.entrySet().stream()
            .map(entry -> {
                int offset = entry.getValue().get(0).getTimezoneOffset() != null ? 
                            entry.getValue().get(0).getTimezoneOffset() : 0;
                String compatibility = Math.abs(offset) <= 3 ? "EXCELLENT" :
                                     Math.abs(offset) <= 6 ? "GOOD" :
                                     Math.abs(offset) <= 9 ? "MODERATE" : "POOR";
                
                return TalentMatchResponseDto.TimezoneGroup.builder()
                    .timezone(entry.getKey())
                    .candidateCount(entry.getValue().size())
                    .offsetHours(offset)
                    .compatibility(compatibility)
                    .build();
            })
            .sorted(Comparator.comparingInt(TalentMatchResponseDto.TimezoneGroup::getCandidateCount).reversed())
            .collect(Collectors.toList());
    }
    
    private String generateMarketInsight(List<CandidateMatchDto> candidates, TalentMatchRequestDto request) {
        int totalCandidates = candidates.size();
        long excellentMatches = candidates.stream()
            .filter(c -> "EXCELLENT".equals(c.getMatchCategory()))
            .count();
        
        if (excellentMatches >= 5) {
            return "Strong talent pool available. Multiple excellent candidates found.";
        } else if (excellentMatches >= 2) {
            return "Good talent availability. Several strong candidates identified.";
        } else if (totalCandidates >= 10) {
            return "Moderate talent pool. Consider expanding search criteria or upskilling existing candidates.";
        } else {
            return "Limited talent pool. Recommend reviewing requirements or considering alternative sourcing strategies.";
        }
    }
    
    private List<String> generateRecommendations(List<CandidateMatchDto> candidates, TalentMatchRequestDto request) {
        List<String> recommendations = new ArrayList<>();
        
        long remoteCount = candidates.stream()
            .filter(c -> Boolean.TRUE.equals(c.getRemotePreference()))
            .count();
        
        if (remoteCount > candidates.size() * 0.5 && !Boolean.TRUE.equals(request.getRemoteAllowed())) {
            recommendations.add("Consider enabling remote work to access wider talent pool");
        }
        
        long internationalCount = candidates.stream()
            .filter(c -> c.getTimezoneOffset() != null && Math.abs(c.getTimezoneOffset()) > 6)
            .count();
        
        if (internationalCount > 3) {
            recommendations.add("Significant international talent available - review work authorization requirements");
        }
        
        if (candidates.stream().noneMatch(c -> c.getOverallMatchScore() >= 80)) {
            recommendations.add("No excellent matches found - consider adjusting requirements or offering training");
        }
        
        return recommendations;
    }
}
