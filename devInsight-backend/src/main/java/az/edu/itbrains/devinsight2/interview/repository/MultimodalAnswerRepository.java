package az.edu.itbrains.devinsight2.interview.repository;

import az.edu.itbrains.devinsight2.interview.entity.MultimodalAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MultimodalAnswerRepository extends JpaRepository<MultimodalAnswerEntity, Long> {
    
    List<MultimodalAnswerEntity> findBySessionIdOrderByAnsweredAtAsc(Long sessionId);
    
    List<MultimodalAnswerEntity> findByQuestionId(Long questionId);
}
