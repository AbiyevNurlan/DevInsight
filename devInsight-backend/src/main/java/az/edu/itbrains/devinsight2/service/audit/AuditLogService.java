package az.edu.itbrains.devinsight2.service.audit;

import az.edu.itbrains.devinsight2.model.core.AuditLog;
import az.edu.itbrains.devinsight2.repository.audit.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Transactional
    public void logCreate(String entityType, Long entityId, Object newEntity) {
        createLog(entityType, entityId, "CREATE", null, newEntity);
    }

    @Transactional
    public void logUpdate(String entityType, Long entityId, Object oldEntity, Object newEntity) {
        createLog(entityType, entityId, "UPDATE", oldEntity, newEntity);
    }

    @Transactional
    public void logDelete(String entityType, Long entityId, Object oldEntity) {
        createLog(entityType, entityId, "DELETE", oldEntity, null);
    }

    private void createLog(String entityType, Long entityId, String action, Object oldEntity, Object newEntity) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .oldValue(oldEntity != null ? objectMapper.writeValueAsString(oldEntity) : null)
                    .newValue(newEntity != null ? objectMapper.writeValueAsString(newEntity) : null)
                    .performedBy(getCurrentUserEmail())
                    .ipAddress(getClientIp())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log created: {} {} on {} id={}", action, entityType, entityId, getCurrentUserEmail());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize entity for audit log", e);
        }
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String forwarded = request.getHeader("X-Forwarded-For");
                if (forwarded != null) {
                    return forwarded.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.debug("Could not determine client IP", e);
        }
        return "unknown";
    }

    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByPerformedAtDesc(pageable);
    }

    public Page<AuditLog> getLogsByEntityType(String entityType, Pageable pageable) {
        return auditLogRepository.findByEntityTypeOrderByPerformedAtDesc(entityType, pageable);
    }

    public List<AuditLog> getLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByPerformedAtDesc(entityType, entityId);
    }

    public List<AuditLog> getRecentLogs(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return auditLogRepository.findRecentLogs(since);
    }
}
