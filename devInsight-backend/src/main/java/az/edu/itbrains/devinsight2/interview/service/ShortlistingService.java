package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.CandidateShortlistDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShortlistingService {
    
    /**
     * Generate shortlist based on candidate scores
     */
    public List<CandidateShortlistDto> generateShortlist(
            List<CandidateShortlistDto> candidates, 
            Integer topN,
            Double minimumPercentage) {
        
        log.info("Generating shortlist from {} candidates", candidates.size());
        
        // Filter by minimum percentage
        List<CandidateShortlistDto> filtered = candidates.stream()
            .filter(c -> c.getOverallPercentage() >= minimumPercentage)
            .collect(Collectors.toList());
        
        log.info("{} candidates passed minimum threshold of {}%", 
            filtered.size(), minimumPercentage);
        
        // Sort by overall percentage (descending)
        filtered.sort(Comparator.comparingDouble(CandidateShortlistDto::getOverallPercentage)
            .reversed());
        
        // Assign ranks
        for (int i = 0; i < filtered.size(); i++) {
            filtered.get(i).setRank(i + 1);
        }
        
        // Add recommendations
        filtered.forEach(this::addRecommendation);
        
        // Return top N
        int limit = Math.min(topN, filtered.size());
        return filtered.subList(0, limit);
    }
    
    /**
     * Add hiring recommendation based on scores
     */
    private void addRecommendation(CandidateShortlistDto candidate) {
        double percentage = candidate.getOverallPercentage();
        
        if (percentage >= 85.0) {
            candidate.setRecommendation("STRONG_YES");
            candidate.setStrengths(List.of(
                "Exceptional performance across all areas",
                "Strong technical and behavioral skills",
                "High potential for immediate contribution"
            ));
        } else if (percentage >= 70.0) {
            candidate.setRecommendation("YES");
            candidate.setStrengths(List.of(
                "Good overall performance",
                "Solid technical foundation",
                "Positive indicators for success"
            ));
        } else if (percentage >= 60.0) {
            candidate.setRecommendation("MAYBE");
            candidate.setConcerns(List.of(
                "Some areas need improvement",
                "Consider for roles with mentorship",
                "May require additional training"
            ));
        } else {
            candidate.setRecommendation("NO");
            candidate.setConcerns(List.of(
                "Below expected performance level",
                "Significant skill gaps identified",
                "Recommend alternative candidates"
            ));
        }
    }
    
    /**
     * Calculate overall candidate score from individual scores
     */
    public CandidateShortlistDto calculateOverallScore(
            Long candidateId,
            String name,
            String email,
            String experienceLevel,
            List<String> skills,
            List<Integer> technicalScores,
            List<Integer> behavioralScores,
            List<Integer> situationalScores) {
        
        int techTotal = technicalScores.stream().mapToInt(Integer::intValue).sum();
        int behavTotal = behavioralScores.stream().mapToInt(Integer::intValue).sum();
        int situTotal = situationalScores.stream().mapToInt(Integer::intValue).sum();
        
        int totalScore = techTotal + behavTotal + situTotal;
        int maxScore = (technicalScores.size() + behavioralScores.size() + situationalScores.size()) * 10;
        
        double percentage = maxScore > 0 ? (totalScore * 100.0) / maxScore : 0.0;
        
        return CandidateShortlistDto.builder()
            .candidateId(candidateId)
            .candidateName(name)
            .email(email)
            .totalScore(totalScore)
            .maxPossibleScore(maxScore)
            .overallPercentage(percentage)
            .experienceLevel(experienceLevel)
            .skills(skills)
            .technicalScore(techTotal)
            .behavioralScore(behavTotal)
            .situationalScore(situTotal)
            .strengths(new ArrayList<>())
            .concerns(new ArrayList<>())
            .build();
    }
}
