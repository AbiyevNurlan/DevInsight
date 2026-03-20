package az.edu.itbrains.devinsight2.repository.interview;

import az.edu.itbrains.devinsight2.model.submission.AnswerStatus;
import az.edu.itbrains.devinsight2.model.interview.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findBySessionId(Long sessionId);

    Optional<InterviewQuestion> findBySessionIdAndQuestionOrder(Long sessionId, Integer order);

    List<InterviewQuestion> findBySessionIdAndStatus(Long sessionId, AnswerStatus status);

    @Query("SELECT q FROM InterviewQuestion q WHERE q.session.id = :sessionId AND q.status = 'PENDING' ORDER BY q.questionOrder ASC")
    Optional<InterviewQuestion> findNextPendingQuestion(@Param("sessionId") Long sessionId);

    @Query("SELECT q FROM InterviewQuestion q WHERE q.session.id = :sessionId AND q.status = 'EVALUATED' ORDER BY q.questionOrder DESC LIMIT 1")
    Optional<InterviewQuestion> findLastEvaluatedQuestion(@Param("sessionId") Long sessionId);

    long countBySessionIdAndStatus(Long sessionId, AnswerStatus status);
}
