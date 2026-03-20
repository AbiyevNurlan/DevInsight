package az.edu.itbrains.devinsight2.interview.repository;

import az.edu.itbrains.devinsight2.interview.entity.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, Long> {
    
    List<FeedbackEntity> findByCandidateId(Long candidateId);
    
    List<FeedbackEntity> findByActualOutcome(String actualOutcome);
    
    List<FeedbackEntity> findByPredictionCorrect(Boolean predictionCorrect);
    
    List<FeedbackEntity> findByFeedbackCategory(String feedbackCategory);
}
