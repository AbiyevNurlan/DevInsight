package az.edu.itbrains.devinsight2.repository.interview;

import az.edu.itbrains.devinsight2.model.core.FeedbackRecommendation;
import az.edu.itbrains.devinsight2.model.interview.InterviewFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    
    Optional<InterviewFeedback> findByInterviewId(Long interviewId);
    
    List<InterviewFeedback> findByCandidateId(Long candidateId);
    
    List<InterviewFeedback> findByReviewerId(Long reviewerId);
    
    Page<InterviewFeedback> findByCandidateIdAndVisibleToCandidateTrue(Long candidateId, Pageable pageable);
    
    List<InterviewFeedback> findByRecommendation(FeedbackRecommendation recommendation);
    
    @Query("SELECT AVG(f.overallRating) FROM InterviewFeedback f WHERE f.candidate.id = :candidateId")
    Double getAverageRatingForCandidate(@Param("candidateId") Long candidateId);
    
    @Query("SELECT f FROM InterviewFeedback f WHERE f.interview.company.id = :companyId")
    Page<InterviewFeedback> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);
    
    @Query("SELECT COUNT(f) FROM InterviewFeedback f WHERE f.recommendation IN :recommendations AND f.interview.company.id = :companyId")
    long countByRecommendationsAndCompany(@Param("recommendations") List<FeedbackRecommendation> recommendations, 
                                          @Param("companyId") Long companyId);
}
