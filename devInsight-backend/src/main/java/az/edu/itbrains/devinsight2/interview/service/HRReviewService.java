package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.HRReviewDto;
import az.edu.itbrains.devinsight2.interview.entity.HRReviewEntity;
import az.edu.itbrains.devinsight2.interview.repository.HRReviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class HRReviewService {
    
    private final HRReviewRepository hrReviewRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Create HR review with AI artifacts
     */
    public HRReviewDto createReview(
            Long candidateId,
            String candidateName,
            Long jobId,
            String jobTitle,
            Map<String, Object> aiArtifacts,
            String aiRecommendation,
            Double aiConfidence,
            String aiReasoning) {
        
        try {
            HRReviewEntity entity = HRReviewEntity.builder()
                .candidateId(candidateId)
                .candidateName(candidateName)
                .jobId(jobId)
                .jobTitle(jobTitle)
                .cvAnalysis(objectMapper.writeValueAsString(aiArtifacts.get("cvAnalysis")))
                .interviewScores(objectMapper.writeValueAsString(aiArtifacts.get("interviewScores")))
                .behavioralAnalysis(objectMapper.writeValueAsString(aiArtifacts.get("behavioralAnalysis")))
                .skillGapAnalysis(objectMapper.writeValueAsString(aiArtifacts.get("skillGapAnalysis")))
                .matchingScore(objectMapper.writeValueAsString(aiArtifacts.get("matchingScore")))
                .aiRecommendation(aiRecommendation)
                .aiConfidence(aiConfidence)
                .aiReasoning(aiReasoning)
                .finalDecision("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            HRReviewEntity saved = hrReviewRepository.save(entity);
            log.info("HR review created for candidate {} and job {}", candidateId, jobId);
            
            return convertToDto(saved);
            
        } catch (Exception e) {
            log.error("Failed to create HR review: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Submit HR decision
     */
    public HRReviewDto submitHRDecision(
            Long reviewId,
            String hrRecommendation,
            String hrNotes,
            String hrDecisionReasoning,
            Boolean agreesWithAI,
            String disagreementReason,
            String finalDecision,
            String decisionMaker) {
        
        try {
            HRReviewEntity entity = hrReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
            
            entity.setHrRecommendation(hrRecommendation);
            entity.setHrNotes(hrNotes);
            entity.setHrDecisionReasoning(hrDecisionReasoning);
            entity.setAgreesWithAI(agreesWithAI);
            entity.setDisagreementReason(disagreementReason);
            entity.setFinalDecision(finalDecision);
            entity.setDecisionMaker(decisionMaker);
            entity.setUpdatedAt(LocalDateTime.now());
            
            HRReviewEntity updated = hrReviewRepository.save(entity);
            log.info("HR decision submitted for review {}: {}", reviewId, finalDecision);
            
            return convertToDto(updated);
            
        } catch (Exception e) {
            log.error("Failed to submit HR decision: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Get review by candidate and job
     */
    public HRReviewDto getReview(Long candidateId, Long jobId) {
        return hrReviewRepository.findByCandidateIdAndJobId(candidateId, jobId)
            .map(this::convertToDto)
            .orElse(null);
    }
    
    /**
     * Get all reviews for candidate
     */
    public List<HRReviewDto> getCandidateReviews(Long candidateId) {
        return hrReviewRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get disagreement cases (for model improvement)
     */
    public List<HRReviewDto> getDisagreementCases() {
        return hrReviewRepository.findByAgreesWithAI(false)
            .stream()
            .map(this::convertToDto)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all pending reviews (not yet decided)
     */
    public List<HRReviewDto> getPendingReviews() {
        return hrReviewRepository.findByFinalDecisionOrderByCreatedAtDesc("PENDING")
            .stream()
            .map(this::convertToDto)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all reviews
     */
    public List<HRReviewDto> getAllReviews() {
        return hrReviewRepository.findAll()
            .stream()
            .map(this::convertToDto)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    private HRReviewDto convertToDto(HRReviewEntity entity) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> cvAnalysis = objectMapper.readValue(entity.getCvAnalysis(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> interviewScores = objectMapper.readValue(entity.getInterviewScores(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> behavioralAnalysis = objectMapper.readValue(entity.getBehavioralAnalysis(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> skillGapAnalysis = objectMapper.readValue(entity.getSkillGapAnalysis(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> matchingScore = objectMapper.readValue(entity.getMatchingScore(), Map.class);
            
            return HRReviewDto.builder()
                .id(entity.getId())
                .candidateId(entity.getCandidateId())
                .candidateName(entity.getCandidateName())
                .jobId(entity.getJobId())
                .jobTitle(entity.getJobTitle())
                .cvAnalysis(cvAnalysis)
                .interviewScores(interviewScores)
                .behavioralAnalysis(behavioralAnalysis)
                .skillGapAnalysis(skillGapAnalysis)
                .matchingScore(matchingScore)
                .aiRecommendation(entity.getAiRecommendation())
                .aiConfidence(entity.getAiConfidence())
                .aiReasoning(entity.getAiReasoning())
                .hrRecommendation(entity.getHrRecommendation())
                .hrNotes(entity.getHrNotes())
                .hrDecisionReasoning(entity.getHrDecisionReasoning())
                .agreesWithAI(entity.getAgreesWithAI())
                .disagreementReason(entity.getDisagreementReason())
                .finalDecision(entity.getFinalDecision())
                .decisionMaker(entity.getDecisionMaker())
                .timestamp(entity.getCreatedAt().toString())
                .build();
        } catch (Exception e) {
            log.error("Failed to convert HR review entity: {}", e.getMessage());
            return null;
        }
    }
}
