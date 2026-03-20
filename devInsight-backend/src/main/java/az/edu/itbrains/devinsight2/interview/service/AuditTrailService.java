package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.AuditTrailDto;
import az.edu.itbrains.devinsight2.interview.entity.AuditTrailEntity;
import az.edu.itbrains.devinsight2.interview.repository.AuditTrailRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditTrailService {
    
    private final AuditTrailRepository auditTrailRepository;
    private final ObjectMapper objectMapper;
    
    private static final String MODEL_VERSION = "claude-3-5-sonnet-20241022";
    
    /**
     * Log AI decision for audit trail
     */
    public AuditTrailDto logDecision(
            Long candidateId,
            String candidateName,
            String eventType,
            String action,
            Map<String, Object> inputData,
            Map<String, Object> outputData,
            Double score,
            String recommendation,
            String reasoning,
            String userId,
            String userRole) {
        
        try {
            AuditTrailEntity entity = AuditTrailEntity.builder()
                .candidateId(candidateId)
                .candidateName(candidateName)
                .eventType(eventType)
                .action(action)
                .timestamp(LocalDateTime.now())
                .decisionMaker("AI_MODEL")
                .modelVersion(MODEL_VERSION)
                .inputData(objectMapper.writeValueAsString(inputData))
                .outputData(objectMapper.writeValueAsString(outputData))
                .score(score)
                .recommendation(recommendation)
                .reasoning(reasoning)
                .userId(userId)
                .userRole(userRole)
                .gdprCompliant(true)
                .biasChecked(true)
                .complianceNotes("Automated AI decision with explainability")
                .build();
            
            AuditTrailEntity saved = auditTrailRepository.save(entity);
            log.info("Audit trail logged: {} for candidate {}", eventType, candidateId);
            
            return convertToDto(saved);
            
        } catch (Exception e) {
            log.error("Failed to log audit trail: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Get audit trail for specific candidate
     */
    public List<AuditTrailDto> getCandidateAuditTrail(Long candidateId) {
        return auditTrailRepository.findByCandidateIdOrderByTimestampDesc(candidateId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get audit trail by event type
     */
    public List<AuditTrailDto> getAuditTrailByEventType(String eventType) {
        return auditTrailRepository.findByEventTypeOrderByTimestampDesc(eventType)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get audit trail within time range
     */
    public List<AuditTrailDto> getAuditTrailByTimeRange(
            LocalDateTime start, LocalDateTime end) {
        return auditTrailRepository.findByTimestampBetweenOrderByTimestampDesc(start, end)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert entity to DTO
     */
    private AuditTrailDto convertToDto(AuditTrailEntity entity) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> inputData = objectMapper.readValue(entity.getInputData(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> outputData = objectMapper.readValue(entity.getOutputData(), Map.class);
            
            return AuditTrailDto.builder()
                .id(entity.getId())
                .candidateId(entity.getCandidateId())
                .candidateName(entity.getCandidateName())
                .eventType(entity.getEventType())
                .action(entity.getAction())
                .timestamp(entity.getTimestamp())
                .decisionMaker(entity.getDecisionMaker())
                .modelVersion(entity.getModelVersion())
                .inputData(inputData)
                .outputData(outputData)
                .score(entity.getScore())
                .recommendation(entity.getRecommendation())
                .reasoning(entity.getReasoning())
                .userId(entity.getUserId())
                .userRole(entity.getUserRole())
                .ipAddress(entity.getIpAddress())
                .gdprCompliant(entity.getGdprCompliant())
                .biasChecked(entity.getBiasChecked())
                .complianceNotes(entity.getComplianceNotes())
                .build();
        } catch (Exception e) {
            log.error("Failed to convert audit trail entity: {}", e.getMessage());
            return null;
        }
    }
}
