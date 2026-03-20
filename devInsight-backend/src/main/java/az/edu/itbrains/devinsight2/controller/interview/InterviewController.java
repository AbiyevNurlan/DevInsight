package az.edu.itbrains.devinsight2.controller.interview;

import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.service.interview.InterviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interviews")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Interview>>> getAllInterviews() {
        log.info("Fetching all interviews");
        try {
            List<Interview> interviews = interviewService.getAllInterviews();
            log.info("Successfully fetched {} interviews", interviews.size());
            return ResponseEntity.ok(ApiResponse.success(interviews));
        } catch (Exception e) {
            log.error("Error fetching interviews: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<Interview>>> getPublicInterviews() {
        log.info("Fetching public interviews");
        List<Interview> interviews = interviewService.getPublicInterviews();
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Interview>>> getActiveInterviews() {
        log.info("Fetching active interviews");
        List<Interview> interviews = interviewService.getActiveInterviews();
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Interview>> getInterviewById(@PathVariable Long id) {
        Interview interview = interviewService.getInterviewById(id);
        return ResponseEntity.ok(ApiResponse.success(interview));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<List<Interview>>> getCompanyInterviews(@PathVariable Long companyId) {
        List<Interview> interviews = interviewService.getCompanyInterviews(companyId);
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Interview>> createInterview(@RequestBody Interview interview) {
        Interview created = interviewService.createInterview(interview);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Interview>> updateInterview(
            @PathVariable Long id,
            @RequestBody Interview updateData
    ) {
        Interview updated = interviewService.updateInterview(id, updateData);
        return ResponseEntity.ok(ApiResponse.success("Interview updated successfully", updated));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Interview>> publishInterview(@PathVariable Long id) {
        Interview published = interviewService.publishInterview(id);
        return ResponseEntity.ok(ApiResponse.success("Interview published successfully", published));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Interview>> archiveInterview(@PathVariable Long id) {
        Interview archived = interviewService.archiveInterview(id);
        return ResponseEntity.ok(ApiResponse.success("Interview archived successfully", archived));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Void>> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok(ApiResponse.success("Interview deleted successfully", null));
    }

    @PostMapping("/{interviewId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Interview>> addQuestionToInterview(
            @PathVariable Long interviewId,
            @PathVariable Long questionId
    ) {
        Interview interview = interviewService.addQuestionToInterview(interviewId, questionId);
        return ResponseEntity.ok(ApiResponse.success("Question added to interview", interview));
    }

    @DeleteMapping("/{interviewId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER')")
    public ResponseEntity<ApiResponse<Interview>> removeQuestionFromInterview(
            @PathVariable Long interviewId,
            @PathVariable Long questionId
    ) {
        Interview interview = interviewService.removeQuestionFromInterview(interviewId, questionId);
        return ResponseEntity.ok(ApiResponse.success("Question removed from interview", interview));
    }
}