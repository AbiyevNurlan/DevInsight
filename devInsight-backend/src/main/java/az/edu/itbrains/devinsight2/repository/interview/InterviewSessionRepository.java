package az.edu.itbrains.devinsight2.repository.interview;

import az.edu.itbrains.devinsight2.model.interview.InterviewSession;
import az.edu.itbrains.devinsight2.model.audio.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    Optional<InterviewSession> findBySessionToken(String sessionToken);

    List<InterviewSession> findByUserIdAndStatus(Long userId, SessionStatus status);

    List<InterviewSession> findByUserId(Long userId);

    Optional<InterviewSession> findByUserIdAndInterviewIdAndStatus(
            Long userId,
            Long interviewId,
            SessionStatus status
    );

    @Query("SELECT s FROM InterviewSession s WHERE s.user.id = :userId AND s.status = 'ACTIVE'")
    Optional<InterviewSession> findActiveSessionByUser(@Param("userId") Long userId);

    @Query("SELECT s FROM InterviewSession s WHERE s.completedAt BETWEEN :startDate AND :endDate")
    List<InterviewSession> findCompletedSessionsBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    long countByUserIdAndStatus(Long userId, SessionStatus status);
}