package az.edu.itbrains.devinsight2.controller.interview;

import az.edu.itbrains.devinsight2.dto.common.PingDto;
import az.edu.itbrains.devinsight2.dto.common.ResponseDto;
import az.edu.itbrains.devinsight2.dto.interview.CancelSessionRequestDto;
import az.edu.itbrains.devinsight2.dto.interview.NextQuestionRequestDto;
import az.edu.itbrains.devinsight2.dto.interview.SessionStatusRequestDto;
import az.edu.itbrains.devinsight2.dto.question.AnswerResponseDto;
import az.edu.itbrains.devinsight2.dto.question.AnswerSubmissionDto;
import az.edu.itbrains.devinsight2.service.interview.InterviewSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class InterviewWebSocketController {

    private final InterviewSessionService sessionService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * User cavabı göndir
     * Client: POST /app/interview/submit-answer
     * Server: Broadcast /topic/answer-received
     */
    @MessageMapping("/interview/submit-answer")
    @SendTo("/topic/answer-received")
    public AnswerResponseDto submitAnswer(
            @Payload AnswerSubmissionDto submission,
            @Header("simpUser") String userId
    ) {
        try {
            log.info("Received answer submission from user: {}, session: {}",
                    userId, submission.getSessionToken());

            if (submission.getSessionToken() == null || submission.getSessionToken().isEmpty()) {
                log.error("Session token is missing");
                return new AnswerResponseDto(false, "Session token required", null);
            }

            if (submission.getAudioUrl() == null || submission.getAudioUrl().isEmpty()) {
                log.error("Audio URL is missing");
                return new AnswerResponseDto(false, "Audio URL required", null);
            }

            // Process answer
            sessionService.submitAnswer(
                    submission.getSessionToken(),
                    submission.getAudioUrl(),
                    submission.getDurationSeconds()
            );

            log.info("Answer processed successfully");

            return new AnswerResponseDto(true, "Answer received and processed", submission.getSessionToken());

        } catch (Exception e) {
            log.error("Failed to process answer: ", e);
            return new AnswerResponseDto(false, e.getMessage(), null);
        }
    }

    /**
     * Next sual iste
     * Client: POST /app/interview/next-question
     * Server: Send to /user/queue/question
     */
    @MessageMapping("/interview/next-question")
    public void requestNextQuestion(
            @Payload NextQuestionRequestDto request,
            @Header("simpUser") String userId
    ) {
        try {
            log.info("Requesting next question for session: {}", request.getSessionToken());

            var session = sessionService.getSessionByToken(request.getSessionToken());

            // Generate next question
            sessionService.generateNextQuestion(session);

            log.info("Next question generated");

            // Send success response
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/question-generated",
                    new ResponseDto(true, "Next question generated")
            );

        } catch (Exception e) {
            log.error("Failed to generate next question: ", e);
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/question-error",
                    new ResponseDto(false, e.getMessage())
            );
        }
    }

    /**
     * Session status yenilə
     * Client: POST /app/interview/session-status
     * Server: Send to /user/queue/status
     */
    @MessageMapping("/interview/session-status")
    public void getSessionStatus(
            @Payload SessionStatusRequestDto request,
            @Header("simpUser") String userId
    ) {
        try {
            log.debug("Getting session status: {}", request.getSessionToken());

            var session = sessionService.getSessionByToken(request.getSessionToken());
            var progress = sessionService.getSessionProgress(session.getId());

            // Send status update
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/session-status",
                    progress
            );

        } catch (Exception e) {
            log.error("Failed to get session status: ", e);
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/status-error",
                    new ResponseDto(false, e.getMessage())
            );
        }
    }

    /**
     * Session ləğv et
     * Client: POST /app/interview/cancel
     * Server: Send to /user/queue/cancelled
     */
    @MessageMapping("/interview/cancel")
    public void cancelSession(
            @Payload CancelSessionRequestDto request,
            @Header("simpUser") String userId
    ) {
        try {
            log.info("Cancelling session: {}", request.getSessionToken());

            // Set cancelled status
            sessionService.pauseSession(request.getSessionToken()); // Use pause as cancel

            log.info("Session cancelled");

            // Notify user
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/cancelled",
                    new ResponseDto(true, "Session cancelled")
            );

        } catch (Exception e) {
            log.error("Failed to cancel session: ", e);
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/cancel-error",
                    new ResponseDto(false, e.getMessage())
            );
        }
    }

    /**
     * Ping test - connection yoxla
     */
    @MessageMapping("/interview/ping")
    public void ping(
            @Payload PingDto ping,
            @Header("simpUser") String userId
    ) {
        try {
            log.debug("Ping received from user: {}", userId);

            PingDto response = new PingDto(
                    ping.getClientTimestamp(),
                    System.currentTimeMillis()
            );

            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/pong",
                    response
            );

        } catch (Exception e) {
            log.error("Failed to send pong: ", e);
        }
    }
}