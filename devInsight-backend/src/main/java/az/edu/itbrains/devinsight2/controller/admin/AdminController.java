package az.edu.itbrains.devinsight2.controller.admin;

import az.edu.itbrains.devinsight2.dto.admin.ParticipantDto;
import az.edu.itbrains.devinsight2.dto.auth.UserManageDto;
import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.common.PageResponse;
import az.edu.itbrains.devinsight2.dto.company.CompanyManageDto;
import az.edu.itbrains.devinsight2.dto.interview.InterviewManageDto;
import az.edu.itbrains.devinsight2.dto.submission.SubmissionManageDto;
import az.edu.itbrains.devinsight2.model.core.AuditLog;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import az.edu.itbrains.devinsight2.service.admin.AdminManagementService;
import az.edu.itbrains.devinsight2.service.audit.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Management", description = "Admin-only endpoints for managing all entities")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminManagementService adminManagementService;
    private final AuditLogService auditLogService;

    // ==================== STATISTICS ====================

    @GetMapping("/stats")
    @Operation(summary = "Get admin statistics", description = "Get overview statistics for admin dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        log.info("Admin stats requested");
        Map<String, Object> stats = adminManagementService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved", stats));
    }

    // ==================== PARTICIPANTS MANAGEMENT ====================

    @GetMapping("/participants")
    @Operation(summary = "Get all interview participants", description = "Get paginated list of all interview participants with exam times and results")
    public ResponseEntity<ApiResponse<PageResponse<ParticipantDto>>> getAllParticipants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "examStartTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role
    ) {
        log.info("Getting all participants - page: {}, size: {}, search: {}, sortBy: {}, sortDir: {}", 
            page, size, search, sortBy, sortDir);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ParticipantDto> participants = adminManagementService.getAllParticipants(
            pageable, search, startDate, endDate, status, role);
        return ResponseEntity.ok(ApiResponse.success("Participants retrieved", PageResponse.of(participants)));
    }

    @GetMapping("/participants/{id}")
    @Operation(summary = "Get participant by ID")
    public ResponseEntity<ApiResponse<ParticipantDto>> getParticipantById(@PathVariable Long id) {
        log.info("Getting participant by id: {}", id);
        ParticipantDto participant = adminManagementService.getParticipantById(id);
        return ResponseEntity.ok(ApiResponse.success("Participant retrieved", participant));
    }

    @GetMapping("/participants/interview/{interviewId}")
    @Operation(summary = "Get participants by interview", description = "Get all participants for a specific interview")
    public ResponseEntity<ApiResponse<List<ParticipantDto>>> getParticipantsByInterview(@PathVariable Long interviewId) {
        log.info("Getting participants for interview: {}", interviewId);
        List<ParticipantDto> participants = adminManagementService.getParticipantsByInterview(interviewId);
        return ResponseEntity.ok(ApiResponse.success("Participants retrieved", participants));
    }

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Get paginated list of all users")
    public ResponseEntity<ApiResponse<PageResponse<UserManageDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Getting all users - page: {}, size: {}, search: {}", page, size, search);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserManageDto> users = adminManagementService.getAllUsers(pageable, search);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", PageResponse.of(users)));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserManageDto>> getUserById(@PathVariable Long id) {
        log.info("Getting user by id: {}", id);
        UserManageDto user = adminManagementService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    @PostMapping("/users")
    @Operation(summary = "Create new user")
    public ResponseEntity<ApiResponse<UserManageDto>> createUser(@Valid @RequestBody UserManageDto dto) {
        log.info("Creating user: {}", dto.getEmail());
        UserManageDto created = adminManagementService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user")
    public ResponseEntity<ApiResponse<UserManageDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserManageDto dto
    ) {
        log.info("Updating user: {}", id);
        UserManageDto updated = adminManagementService.updateUser(id, dto);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("Deleting user: {}", id);
        adminManagementService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    // ==================== INTERVIEW MANAGEMENT ====================

    @GetMapping("/interviews")
    @Operation(summary = "Get all interviews")
    public ResponseEntity<ApiResponse<PageResponse<InterviewManageDto>>> getAllInterviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Getting all interviews - page: {}, size: {}", page, size);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<InterviewManageDto> interviews = adminManagementService.getAllInterviews(pageable, search);
        return ResponseEntity.ok(ApiResponse.success("Interviews retrieved", PageResponse.of(interviews)));
    }

    @GetMapping("/interviews/{id}")
    @Operation(summary = "Get interview by ID")
    public ResponseEntity<ApiResponse<InterviewManageDto>> getInterviewById(@PathVariable Long id) {
        log.info("Getting interview by id: {}", id);
        InterviewManageDto interview = adminManagementService.getInterviewById(id);
        return ResponseEntity.ok(ApiResponse.success("Interview retrieved", interview));
    }

    @PostMapping("/interviews")
    @Operation(summary = "Create new interview")
    public ResponseEntity<ApiResponse<InterviewManageDto>> createInterview(@Valid @RequestBody InterviewManageDto dto) {
        log.info("Creating interview: {}", dto.getTitle());
        InterviewManageDto created = adminManagementService.createInterview(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview created successfully", created));
    }

    @PutMapping("/interviews/{id}")
    @Operation(summary = "Update interview")
    public ResponseEntity<ApiResponse<InterviewManageDto>> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewManageDto dto
    ) {
        log.info("Updating interview: {}", id);
        InterviewManageDto updated = adminManagementService.updateInterview(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Interview updated successfully", updated));
    }

    @DeleteMapping("/interviews/{id}")
    @Operation(summary = "Delete interview")
    public ResponseEntity<ApiResponse<Void>> deleteInterview(@PathVariable Long id) {
        log.info("Deleting interview: {}", id);
        adminManagementService.deleteInterview(id);
        return ResponseEntity.ok(ApiResponse.success("Interview deleted successfully", null));
    }

    // ==================== COMPANY MANAGEMENT ====================

    @GetMapping("/companies")
    @Operation(summary = "Get all companies")
    public ResponseEntity<ApiResponse<PageResponse<CompanyManageDto>>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Getting all companies - page: {}, size: {}", page, size);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CompanyManageDto> companies = adminManagementService.getAllCompanies(pageable, search);
        return ResponseEntity.ok(ApiResponse.success("Companies retrieved", PageResponse.of(companies)));
    }

    @GetMapping("/companies/{id}")
    @Operation(summary = "Get company by ID")
    public ResponseEntity<ApiResponse<CompanyManageDto>> getCompanyById(@PathVariable Long id) {
        log.info("Getting company by id: {}", id);
        CompanyManageDto company = adminManagementService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.success("Company retrieved", company));
    }

    @PostMapping("/companies")
    @Operation(summary = "Create new company")
    public ResponseEntity<ApiResponse<CompanyManageDto>> createCompany(@Valid @RequestBody CompanyManageDto dto) {
        log.info("Creating company: {}", dto.getName());
        CompanyManageDto created = adminManagementService.createCompany(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created successfully", created));
    }

    @PutMapping("/companies/{id}")
    @Operation(summary = "Update company")
    public ResponseEntity<ApiResponse<CompanyManageDto>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyManageDto dto
    ) {
        log.info("Updating company: {}", id);
        CompanyManageDto updated = adminManagementService.updateCompany(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Company updated successfully", updated));
    }

    @DeleteMapping("/companies/{id}")
    @Operation(summary = "Delete company")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Long id) {
        log.info("Deleting company: {}", id);
        adminManagementService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success("Company deleted successfully", null));
    }

    // ==================== SUBMISSION MANAGEMENT ====================

    @GetMapping("/submissions")
    @Operation(summary = "Get all submissions")
    public ResponseEntity<ApiResponse<PageResponse<SubmissionManageDto>>> getAllSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Getting all submissions - page: {}, size: {}", page, size);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<SubmissionManageDto> submissions = adminManagementService.getAllSubmissions(pageable, search);
        return ResponseEntity.ok(ApiResponse.success("Submissions retrieved", PageResponse.of(submissions)));
    }

    @GetMapping("/submissions/{id}")
    @Operation(summary = "Get submission by ID")
    public ResponseEntity<ApiResponse<SubmissionManageDto>> getSubmissionById(@PathVariable Long id) {
        log.info("Getting submission by id: {}", id);
        SubmissionManageDto submission = adminManagementService.getSubmissionById(id);
        return ResponseEntity.ok(ApiResponse.success("Submission retrieved", submission));
    }

    @PatchMapping("/submissions/{id}/status")
    @Operation(summary = "Update submission status")
    public ResponseEntity<ApiResponse<SubmissionManageDto>> updateSubmissionStatus(
            @PathVariable Long id,
            @RequestParam SubmissionStatus status
    ) {
        log.info("Updating submission status: {} -> {}", id, status);
        SubmissionManageDto updated = adminManagementService.updateSubmissionStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Submission status updated", updated));
    }

    @DeleteMapping("/submissions/{id}")
    @Operation(summary = "Delete submission")
    public ResponseEntity<ApiResponse<Void>> deleteSubmission(@PathVariable Long id) {
        log.info("Deleting submission: {}", id);
        adminManagementService.deleteSubmission(id);
        return ResponseEntity.ok(ApiResponse.success("Submission deleted successfully", null));
    }

    // ==================== AUDIT LOGS ====================

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs")
    public ResponseEntity<ApiResponse<PageResponse<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entityType
    ) {
        log.info("Getting audit logs - page: {}, size: {}, entityType: {}", page, size, entityType);
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs;
        if (entityType != null && !entityType.isEmpty()) {
            logs = auditLogService.getLogsByEntityType(entityType, pageable);
        } else {
            logs = auditLogService.getAllLogs(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", PageResponse.of(logs)));
    }

    @GetMapping("/audit-logs/recent")
    @Operation(summary = "Get recent audit logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentAuditLogs(
            @RequestParam(defaultValue = "24") int hours
    ) {
        log.info("Getting recent audit logs - last {} hours", hours);
        List<AuditLog> logs = auditLogService.getRecentLogs(hours);
        return ResponseEntity.ok(ApiResponse.success("Recent audit logs retrieved", logs));
    }
}
