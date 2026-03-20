package az.edu.itbrains.devinsight2.controller.submission;

import az.edu.itbrains.devinsight2.dto.submission.SubmissionDto;
import az.edu.itbrains.devinsight2.service.submission.SubmissionApiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/submissions/api")
@RequiredArgsConstructor
@Slf4j
@Validated
public class SubmissionApiController {

    private final SubmissionApiService submissionApiService;

    @PostMapping
    public ResponseEntity<SubmissionDto> createSubmission(
            @Valid @RequestBody SubmissionDto submissionDto,
            @RequestHeader("X-Tenant-ID") String tenantId) {
        
        log.info("POST /api/submissions - Creating submission for tenant: {}", tenantId);
        
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("X-Tenant-ID header is required");
        }
        
        SubmissionDto created = submissionApiService.save(submissionDto, tenantId);
        
        URI location = URI.create("/api/submissions/" + created.getId());
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .location(location)
                .body(created);
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<List<SubmissionDto>> getSubmissionsByInterview(
            @PathVariable Long interviewId,
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        
        log.info("GET /api/submissions/{} - tenant: {}, page: {}", interviewId, tenantId, pageable.getPageNumber());
        
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("X-Tenant-ID header is required");
        }
        
        // If pagination is requested, return paginated result
        if (pageable.isPaged()) {
            Page<SubmissionDto> page = submissionApiService.getPageByInterviewAndTenant(interviewId, tenantId, pageable);
            return ResponseEntity.ok()
                    .header("X-Total-Count", String.valueOf(page.getTotalElements()))
                    .header("X-Total-Pages", String.valueOf(page.getTotalPages()))
                    .body(page.getContent());
        } else {
            // Return all results
            List<SubmissionDto> submissions = submissionApiService.getByInterviewAndTenant(interviewId, tenantId);
            return ResponseEntity.ok(submissions);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable Long id,
            @RequestHeader("X-Tenant-ID") String tenantId) {
        
        log.info("DELETE /api/submissions/{} - tenant: {}", id, tenantId);
        
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("X-Tenant-ID header is required");
        }
        
        submissionApiService.deleteByIdScoped(id, tenantId);
        
        return ResponseEntity.noContent().build();
    }
}