package az.edu.itbrains.devinsight2.repository.submission;

import az.edu.itbrains.devinsight2.model.submission.InterviewSubmission;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSubmissionRepository extends JpaRepository<InterviewSubmission, Long> {

    @Query("SELECT s FROM InterviewSubmission s LEFT JOIN FETCH s.interview LEFT JOIN FETCH s.submittedBy WHERE s.id = :id")
    Optional<InterviewSubmission> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT s FROM InterviewSubmission s WHERE s.interview.id = :interviewId AND s.submittedBy.id = :userId")
    Optional<InterviewSubmission> findByInterviewAndUser(
            @Param("interviewId") Long interviewId,
            @Param("userId") Long userId
    );

    @Query("SELECT DISTINCT s FROM InterviewSubmission s LEFT JOIN FETCH s.answers WHERE s.interview.id = :interviewId")
    List<InterviewSubmission> findByInterviewId(@Param("interviewId") Long interviewId);

    @Query("SELECT DISTINCT s FROM InterviewSubmission s LEFT JOIN FETCH s.answers WHERE s.submittedBy.id = :userId")
    List<InterviewSubmission> findByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM InterviewSubmission s WHERE s.status = :status AND s.interview.id = :interviewId")
    List<InterviewSubmission> findByStatusAndInterview(
            @Param("status") SubmissionStatus status,
            @Param("interviewId") Long interviewId
    );

    long countByInterviewIdAndStatus(@Param("interviewId") Long interviewId, @Param("status") SubmissionStatus status);
}
