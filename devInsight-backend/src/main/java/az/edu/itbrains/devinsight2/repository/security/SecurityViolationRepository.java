package az.edu.itbrains.devinsight2.repository.security;

import az.edu.itbrains.devinsight2.model.security.SecurityViolation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SecurityViolationRepository extends JpaRepository<SecurityViolation, Long> {

    List<SecurityViolation> findByUserId(Long userId);

    List<SecurityViolation> findByInterviewId(Long interviewId);

    @Query("SELECT sv FROM SecurityViolation sv WHERE sv.user.id = :userId AND sv.interview.id = :interviewId")
    List<SecurityViolation> findByUserAndInterview(
            @Param("userId") Long userId, 
            @Param("interviewId") Long interviewId
    );

    @Query("SELECT sv FROM SecurityViolation sv WHERE sv.resolved = false")
    List<SecurityViolation> findUnresolved();

    @Query("SELECT sv FROM SecurityViolation sv WHERE sv.hrNotified = false")
    List<SecurityViolation> findUnnotified();

    @Query("SELECT sv FROM SecurityViolation sv WHERE sv.severity = 'HIGH' OR sv.severity = 'CRITICAL'")
    List<SecurityViolation> findCriticalViolations();

    @Query("SELECT sv FROM SecurityViolation sv WHERE sv.createdAt >= :since")
    List<SecurityViolation> findRecentViolations(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(sv) FROM SecurityViolation sv WHERE sv.user.id = :userId AND sv.interview.id = :interviewId")
    Long countByUserAndInterview(@Param("userId") Long userId, @Param("interviewId") Long interviewId);
}
