package az.edu.itbrains.devinsight2.interview.controller;

import az.edu.itbrains.devinsight2.cv.entity.CandidateCV;
import az.edu.itbrains.devinsight2.cv.repository.CandidateCVRepository;
import az.edu.itbrains.devinsight2.interview.dto.*;
import az.edu.itbrains.devinsight2.interview.service.GlobalTalentMatchingService;
import az.edu.itbrains.devinsight2.interview.service.SemanticMatchingService;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/interview/matching")
@RequiredArgsConstructor
@Slf4j
public class TalentMatchingController {
    
    private final GlobalTalentMatchingService globalTalentMatchingService;
    private final SemanticMatchingService semanticMatchingService;
    private final UserRepository userRepository;
    private final CandidateCVRepository candidateCVRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Find global talent matches for a job
     */
    @PostMapping("/find-matches")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> findTalentMatches(
            @RequestBody TalentMatchRequestDto request,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Finding talent matches for job: {}", request.getJobTitle());
            
            List<CandidateMatchDto> candidates = loadCandidatesFromDatabase(request, limit);
            
            TalentMatchResponseDto matches = 
                globalTalentMatchingService.findTalentMatches(request, candidates);
            
            response.put("success", true);
            response.put("message", "Talent matching completed");
            response.put("matches", matches);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to find talent matches", e);
            response.put("success", false);
            response.put("message", "Talent matching failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Calculate semantic match between job and candidate
     */
    @PostMapping("/semantic-match")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> calculateSemanticMatch(
            @RequestBody SemanticMatchRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Calculating semantic match");
            
            SemanticMatchResponseDto semanticMatch = 
                semanticMatchingService.calculateSemanticMatch(request);
            
            response.put("success", true);
            response.put("message", "Semantic matching completed");
            response.put("match", semanticMatch);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to calculate semantic match", e);
            response.put("success", false);
            response.put("message", "Semantic matching failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Load real candidates from database with CV analysis data
     */
    private List<CandidateMatchDto> loadCandidatesFromDatabase(TalentMatchRequestDto request, int limit) {
        List<User> candidateUsers = userRepository.findByRoleWithSkills(UserRole.CANDIDATE);
        
        List<CandidateMatchDto> candidates = new ArrayList<>();
        
        for (User user : candidateUsers) {
            if (candidates.size() >= limit) break;
            
            Optional<CandidateCV> cvOpt = candidateCVRepository.findByUserId(user.getId());
            
            List<String> skills = new ArrayList<>(user.getSkills() != null ? user.getSkills() : Set.of());
            String experienceLevel = "MID";
            int yearsOfExperience = 0;
            
            // Enrich from CV analysis if available
            if (cvOpt.isPresent() && Boolean.TRUE.equals(cvOpt.get().getIsAnalyzed())) {
                CandidateCV cv = cvOpt.get();
                
                if (cv.getAnalysisSkills() != null) {
                    try {
                        List<String> cvSkills = objectMapper.readValue(cv.getAnalysisSkills(), new TypeReference<List<String>>() {});
                        for (String s : cvSkills) {
                            if (!skills.contains(s)) skills.add(s);
                        }
                    } catch (Exception ignored) {}
                }
                
                if (cv.getExperienceLevel() != null) {
                    experienceLevel = cv.getExperienceLevel();
                }
                if (cv.getYearsOfExperience() != null) {
                    yearsOfExperience = cv.getYearsOfExperience();
                }
            }
            
            // Calculate matching/missing skills against required
            List<String> requiredSkills = request.getRequiredSkills() != null ? request.getRequiredSkills() : List.of();
            List<String> matchingSkills = skills.stream()
                .filter(s -> requiredSkills.stream().anyMatch(r -> r.equalsIgnoreCase(s)))
                .collect(Collectors.toList());
            List<String> missingSkills = requiredSkills.stream()
                .filter(r -> skills.stream().noneMatch(s -> s.equalsIgnoreCase(r)))
                .collect(Collectors.toList());
            List<String> bonusSkills = skills.stream()
                .filter(s -> requiredSkills.stream().noneMatch(r -> r.equalsIgnoreCase(s)))
                .collect(Collectors.toList());
            
            int matchPercentage = requiredSkills.isEmpty() ? 100 
                : (int) ((matchingSkills.size() * 100.0) / requiredSkills.size());
            
            candidates.add(CandidateMatchDto.builder()
                .candidateId(user.getId())
                .candidateName(user.getFullName())
                .email(user.getEmail())
                .currentLocation("Baku")
                .timezone("UTC+4")
                .timezoneOffset(4)
                .willingToRelocate(false)
                .remotePreference(true)
                .workArrangementPreference("REMOTE")
                .matchingSkills(matchingSkills)
                .missingSkills(missingSkills)
                .bonusSkills(bonusSkills.size() > 5 ? bonusSkills.subList(0, 5) : bonusSkills)
                .skillMatchPercentage(matchPercentage)
                .experienceLevel(experienceLevel)
                .yearsOfExperience(yearsOfExperience)
                .previousRoles(List.of())
                .gdprCompliant(true)
                .workAuthorizationValid(true)
                .certifications(List.of())
                .strengths(new ArrayList<>())
                .concerns(new ArrayList<>())
                .build());
        }
        
        return candidates;
    }
}
