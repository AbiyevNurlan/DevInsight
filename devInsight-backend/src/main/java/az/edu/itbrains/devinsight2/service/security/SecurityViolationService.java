package az.edu.itbrains.devinsight2.service.security;

import az.edu.itbrains.devinsight2.dto.security.ViolationDto;
import az.edu.itbrains.devinsight2.dto.security.ViolationReportDto;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.security.SecurityViolation;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.security.SecurityViolationRepository;
import az.edu.itbrains.devinsight2.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor    
@Slf4j
public class SecurityViolationService {

    private final SecurityViolationRepository violationRepository;
    private final InterviewRepository interviewRepository;
    private final CurrentUserService currentUserService;
    private final SimpMessagingTemplate messagingTemplate;
    private final HttpServletRequest request;

    @Transactional
    public ViolationDto reportViolation(ViolationReportDto dto) {
        User currentUser = currentUserService.getCurrentUser();
        
        Interview interview = interviewRepository.findById(dto.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        // Determine severity
        SecurityViolation.ViolationSeverity severity = determineSeverity(dto.getType());
        
        // Create violation
        SecurityViolation violation = SecurityViolation.builder()
                .user(currentUser)
                .interview(interview)
                .type(SecurityViolation.ViolationType.valueOf(dto.getType()))
                .details(dto.getDetails())
                .severity(severity)
                .ipAddress(getClientIp())
                .userAgent(request.getHeader("User-Agent"))
                .videoTimestamp(dto.getVideoTimestamp())
                .resolved(false)
                .hrNotified(false)
                .build();

        violation = violationRepository.save(violation);
        
        log.warn("🚨 SECURITY VIOLATION: {} - User: {} ({}), Interview: {}, Severity: {}", 
                dto.getType(), currentUser.getFullName(), currentUser.getEmail(), 
                interview.getTitle(), severity);

        // Notify HR in real-time via WebSocket
        notifyHR(violation);

        // Auto-reject if critical
        if (severity == SecurityViolation.ViolationSeverity.CRITICAL) {
            Long violationCount = violationRepository.countByUserAndInterview(
                    currentUser.getId(), interview.getId());
            
            if (violationCount >= 3) {
                log.error("❌ AUTO-REJECT: User {} has {} critical violations", 
                        currentUser.getEmail(), violationCount);
                // Here you could auto-fail the interview
            }
        }

        return toDto(violation);
    }

    private SecurityViolation.ViolationSeverity determineSeverity(String type) {
        return switch (type) {
            case "COPY_ATTEMPT", "PASTE_ATTEMPT", "CUT_ATTEMPT", 
                 "DEVTOOLS_ATTEMPT", "DEVTOOLS_OPEN", "INSPECT_ATTEMPT",
                 "AI_CONTENT_DETECTED", "FACE_MISMATCH", "MULTIPLE_FACES" -> 
                    SecurityViolation.ViolationSeverity.HIGH;
            
            case "CAMERA_DENIED", "SCREEN_SHARE_STOPPED", "NO_FACE_DETECTED" -> 
                    SecurityViolation.ViolationSeverity.CRITICAL;
            
            case "TAB_SWITCH", "WINDOW_BLUR", "FULLSCREEN_EXIT", 
                 "KEYBOARD_SHORTCUT", "SUSPICIOUS_TYPING" -> 
                    SecurityViolation.ViolationSeverity.MEDIUM;
            
            default -> SecurityViolation.ViolationSeverity.LOW;
        };
    }

    private void notifyHR(SecurityViolation violation) {
        try {
            ViolationDto dto = toDto(violation);
            
            // Send to all HR users via WebSocket
            messagingTemplate.convertAndSend("/topic/hr/violations", dto);
            
            // Send to specific interview monitoring channel
            messagingTemplate.convertAndSend(
                    "/topic/hr/interviews/" + violation.getInterview().getId() + "/violations", 
                    dto
            );
            
            violation.setHrNotified(true);
            violationRepository.save(violation);
            
            log.info("✅ HR notified about violation: {}", violation.getId());
        } catch (Exception e) {
            log.error("Failed to notify HR: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ViolationDto> getInterviewViolations(Long interviewId) {
        return violationRepository.findByInterviewId(interviewId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ViolationDto> getUserViolations(Long userId, Long interviewId) {
        return violationRepository.findByUserAndInterview(userId, interviewId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ViolationDto> getRecentViolations(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return violationRepository.findRecentViolations(since)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ViolationDto> getCriticalViolations() {
        return violationRepository.findCriticalViolations()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void resolveViolation(Long violationId) {
        SecurityViolation violation = violationRepository.findById(violationId)
                .orElseThrow(() -> new RuntimeException("Violation not found"));
        
        violation.setResolved(true);
        violationRepository.save(violation);
        
        log.info("Violation {} resolved", violationId);
    }

    private ViolationDto toDto(SecurityViolation violation) {
        return ViolationDto.builder()
                .id(violation.getId())
                .type(violation.getType().name())
                .details(violation.getDetails())
                .severity(violation.getSeverity().name())
                .timestamp(violation.getCreatedAt())
                .userName(violation.getUser().getFullName())
                .userEmail(violation.getUser().getEmail())
                .interviewTitle(violation.getInterview() != null ? 
                        violation.getInterview().getTitle() : null)
                .interviewId(violation.getInterview() != null ? 
                        violation.getInterview().getId() : null)
                .ipAddress(violation.getIpAddress())
                .resolved(violation.getResolved())
                .hrNotified(violation.getHrNotified())
                .build();
    }

    private String getClientIp() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
