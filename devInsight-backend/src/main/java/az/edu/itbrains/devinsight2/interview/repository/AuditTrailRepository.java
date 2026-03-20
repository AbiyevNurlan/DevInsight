package az.edu.itbrains.devinsight2.interview.repository;

import az.edu.itbrains.devinsight2.interview.entity.AuditTrailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditTrailRepository extends JpaRepository<AuditTrailEntity, Long> {
    
    List<AuditTrailEntity> findByCandidateIdOrderByTimestampDesc(Long candidateId);
    
    List<AuditTrailEntity> findByEventTypeOrderByTimestampDesc(String eventType);
    
    List<AuditTrailEntity> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime start, LocalDateTime end);
    
    List<AuditTrailEntity> findByUserIdOrderByTimestampDesc(String userId);
}
