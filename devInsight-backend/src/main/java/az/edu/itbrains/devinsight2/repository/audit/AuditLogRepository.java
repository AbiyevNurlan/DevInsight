package az.edu.itbrains.devinsight2.repository.audit;

import az.edu.itbrains.devinsight2.model.core.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByEntityTypeOrderByPerformedAtDesc(String entityType, Pageable pageable);

    Page<AuditLog> findByPerformedByOrderByPerformedAtDesc(String performedBy, Pageable pageable);

    List<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(String entityType, Long entityId);

    @Query("SELECT a FROM AuditLog a WHERE a.performedAt >= :since ORDER BY a.performedAt DESC")
    List<AuditLog> findRecentLogs(LocalDateTime since);

    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
}
