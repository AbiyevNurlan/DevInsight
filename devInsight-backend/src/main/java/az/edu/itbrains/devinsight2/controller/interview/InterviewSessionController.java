package az.edu.itbrains.devinsight2.controller.interview;

import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.interview.InterviewSessionDto;
import az.edu.itbrains.devinsight2.dto.interview.SessionProgressDto;
import az.edu.itbrains.devinsight2.dto.interview.SessionReportDto;
import az.edu.itbrains.devinsight2.dto.question.CurrentQuestionDto;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.service.interview.InterviewSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/interviews/{interviewId}/sessions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Interview Sessions", description = "Real-time interview session management")
public class InterviewSessionController {

    private final InterviewSessionService sessionService;


    @PostMapping("/start")
    @Operation(summary = "Start interview session", description = "Begin a new interactive interview")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> startSession(
            @PathVariable Long interviewId,
            @AuthenticationPrincipal User user
    ) {
        try {
            log.info("Starting interview session for user: {}, interview: {}", user.getId(), interviewId);

            InterviewSessionDto sessionDto = sessionService.startInterview(
                    user.getId(),
                    interviewId,
                    user
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Interview session started successfully", sessionDto));

        } catch (RuntimeException e) {
            log.error("Failed to start interview session: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("An unexpected error occurred"));
        }
    }


    @GetMapping("/{sessionId}")
    @Operation(summary = "Get session details", description = "Retrieve interview session information")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> getSession(
            @PathVariable Long interviewId,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user
    ) {
        try {
            log.debug("Getting session: {}", sessionId);

            var session = sessionService.getSession(sessionId);


            if (!session.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Unauthorized access to this session"));
            }


            if (!session.getInterview().getId().equals(interviewId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Interview ID mismatch"));
            }

            return ResponseEntity.ok(ApiResponse.success(
                    "Session retrieved successfully",
                    new InterviewSessionDto(session)
            ));

        } catch (RuntimeException e) {
            log.error("Failed to get session: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }


    @GetMapping("/{sessionId}/progress")
    @Operation(summary = "Get session progress", description = "Get current progress and stats")
    public ResponseEntity<ApiResponse<SessionProgressDto>> getProgress(
            @PathVariable Long interviewId,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user
    ) {
        try {
            log.debug("Getting progress for session: {}", sessionId);

            var session = sessionService.getSession(sessionId);


            if (!session.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Unauthorized access"));
            }

            SessionProgressDto progress = sessionService.getSessionProgress(sessionId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Progress retrieved successfully",
                    progress
            ));

        } catch (RuntimeException e) {
            log.error("Failed to get progress: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }


    @GetMapping("/{sessionId}/report")
    @Operation(summary = "Get session report", description = "Get final report and evaluation results")
    public ResponseEntity<ApiResponse<SessionReportDto>> getReport(
            @PathVariable Long interviewId,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user
    ) {
        try {
            log.debug("Getting report for session: {}", sessionId);

            var session = sessionService.getSession(sessionId);


            if (!session.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Unauthorized access"));
            }

            SessionReportDto report = sessionService.getSessionReport(sessionId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Report retrieved successfully",
                    report
            ));

        } catch (RuntimeException e) {
            log.error("Failed to get report: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{sessionId}/pause")
    @Operation(summary = "Pause session", description = "Pause current interview session")
    public ResponseEntity<ApiResponse<String>> pauseSession(
            @PathVariable Long interviewId,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user
    ) {
        try {
            log.info("Pausing session: {}", sessionId);

            var session = sessionService.getSession(sessionId);

            // Validate ownership
            if (!session.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Unauthorized access"));
            }

            sessionService.pauseSession(session.getSessionToken());

            return ResponseEntity.ok(ApiResponse.success(
                    "Session paused successfully",
                    null
            ));

        } catch (RuntimeException e) {
            log.error("Failed to pause session: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }


    @PostMapping("/{sessionId}/resume")
    @Operation(summary = "Resume session", description = "Resume paused interview session")
    public ResponseEntity<ApiResponse<String>> resumeSession(
            @PathVariable Long interviewId,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user
    ) {
        try {
            log.info("Resuming session: {}", sessionId);

            var session = sessionService.getSession(sessionId);

            // Validate ownership
            if (!session.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Unauthorized access"));
            }

            sessionService.resumeSession(session.getSessionToken());

            return ResponseEntity.ok(ApiResponse.success(
                    "Session resumed successfully",
                    null
            ));

        } catch (RuntimeException e) {
            log.error("Failed to resume session: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }


    @GetMapping("/{sessionId}/current-question")
    @Operation(summary = "Get current question", description = "Get the current question in session")
    public ResponseEntity<ApiResponse<CurrentQuestionDto>> getCurrentQuestion(
            @PathVariable Long interviewId,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user
    ) {
        try {
            log.debug("Getting current question for session: {}", sessionId);

            var session = sessionService.getSession(sessionId);

            if (!session.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Unauthorized access"));
            }

            CurrentQuestionDto question = sessionService.getCurrentQuestion(sessionId);

            if (question == null) {
                return ResponseEntity.ok(ApiResponse.success(
                        "No pending questions",
                        null
                ));
            }

            return ResponseEntity.ok(ApiResponse.success(
                    "Current question retrieved",
                    question
            ));

        } catch (RuntimeException e) {
            log.error("Failed to get current question: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
