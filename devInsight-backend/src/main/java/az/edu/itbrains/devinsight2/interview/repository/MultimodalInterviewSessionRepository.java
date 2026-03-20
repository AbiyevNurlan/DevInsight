package az.edu.itbrains.devinsight2.interview.repository;

import az.edu.itbrains.devinsight2.interview.entity.InterviewSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MultimodalInterviewSessionRepository extends JpaRepository<InterviewSessionEntity, Long> {
    
    List<InterviewSessionEntity> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
    
    List<InterviewSessionEntity> findByStatusOrderByScheduledTimeAsc(String status);
    
    List<InterviewSessionEntity> findBySessionTypeOrderByCreatedAtDesc(String sessionType);
}
