package az.edu.itbrains.devinsight2.repository.submission;

import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    // Legacy methods
    List<Submission> findByCandidateId(Long candidateId);
    List<Submission> findByInterviewId(Long interviewId);
    List<Submission> findByStatus(SubmissionStatus status);
    Optional<Submission> findByInterviewIdAndCandidateIdAndQuestionId(
            Long interviewId, Long candidateId, Long questionId
    );
    
    // Tenant-scoped methods (required for grading)
    List<Submission> findByInterviewIdAndTenantId(Long interviewId, String tenantId);
    Page<Submission> findByInterviewIdAndTenantId(Long interviewId, String tenantId, Pageable pageable);
    Optional<Submission> findByIdAndTenantId(Long id, String tenantId);
    
    // Dashboard statistics queries
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.videoUrl IS NOT NULL AND s.videoUrl <> ''")
    long countVideoSubmissions();
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.codeSubmission IS NOT NULL AND s.codeSubmission <> ''")
    long countCodeSubmissions();
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.textAnswer IS NOT NULL AND s.textAnswer <> ''")
    long countTextSubmissions();
    
    @Query("SELECT s FROM Submission s " +
           "LEFT JOIN FETCH s.interview " +
           "LEFT JOIN FETCH s.candidate " +
           "ORDER BY s.createdAt DESC")
    List<Submission> findRecentSubmissions(Pageable pageable);
    
    // Participant queries with eager loading
    @Query("SELECT s FROM Submission s " +
           "LEFT JOIN FETCH s.interview i " +
           "LEFT JOIN FETCH i.company " +
           "LEFT JOIN FETCH s.candidate " +
           "LEFT JOIN FETCH s.analysis")
    List<Submission> findAllWithRelations();
    
    @Query("SELECT s FROM Submission s " +
           "LEFT JOIN FETCH s.interview i " +
           "LEFT JOIN FETCH i.company " +
           "LEFT JOIN FETCH s.candidate " +
           "LEFT JOIN FETCH s.analysis " +
           "WHERE s.interview.id = :interviewId")
    List<Submission> findByInterviewIdWithRelations(@Param("interviewId") Long interviewId);
}