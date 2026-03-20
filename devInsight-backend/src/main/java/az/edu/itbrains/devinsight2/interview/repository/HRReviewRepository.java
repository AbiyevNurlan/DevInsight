package az.edu.itbrains.devinsight2.interview.repository;

import az.edu.itbrains.devinsight2.interview.entity.HRReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HRReviewRepository extends JpaRepository<HRReviewEntity, Long> {
    
    List<HRReviewEntity> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
    
    List<HRReviewEntity> findByJobIdOrderByCreatedAtDesc(Long jobId);
    
    List<HRReviewEntity> findByFinalDecisionOrderByCreatedAtDesc(String finalDecision);
    
    Optional<HRReviewEntity> findByCandidateIdAndJobId(Long candidateId, Long jobId);
    
    List<HRReviewEntity> findByAgreesWithAI(Boolean agreesWithAI);
}
