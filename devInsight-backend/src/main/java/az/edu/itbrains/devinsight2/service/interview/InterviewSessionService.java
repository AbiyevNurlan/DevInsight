package az.edu.itbrains.devinsight2.service.interview;

import az.edu.itbrains.devinsight2.dto.interview.InterviewSessionDto;
import az.edu.itbrains.devinsight2.dto.interview.SessionProgressDto;
import az.edu.itbrains.devinsight2.dto.interview.SessionReportDto;
import az.edu.itbrains.devinsight2.dto.question.AnswerDetailDto;
import az.edu.itbrains.devinsight2.dto.question.CurrentQuestionDto;
import az.edu.itbrains.devinsight2.model.audio.AudioType;
import az.edu.itbrains.devinsight2.model.audio.SessionAudio;
import az.edu.itbrains.devinsight2.model.audio.SessionStatus;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewQuestion;
import az.edu.itbrains.devinsight2.model.interview.InterviewSession;
import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.model.submission.AnswerStatus;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.interview.InterviewQuestionRepository;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.interview.InterviewSessionRepository;
import az.edu.itbrains.devinsight2.repository.submission.SessionAudioRepository;
import az.edu.itbrains.devinsight2.service.question.AnswerEvaluationService;
import az.edu.itbrains.devinsight2.service.integration.SpeechToTextService;
import az.edu.itbrains.devinsight2.service.integration.TextToSpeechService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewSessionService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final SessionAudioRepository audioRepository;
    private final InterviewRepository interviewRepository;
    private final TextToSpeechService textToSpeechService;
    private final SpeechToTextService speechToTextService;
    private final AnswerEvaluationService evaluationService;

    @Value("${interview.max-questions:5}")
    private Integer maxQuestions;

    /**
     * Yeni interview session başlat
     */
    @Transactional
    public InterviewSessionDto startInterview(Long userId, Long interviewId, User user) {
        try {
            log.info("Starting interview session for user: {}, interview: {}", userId, interviewId);

            // Validate interview exists
            Interview interview = interviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));


            // Check if user already has active session
            var existingSession = sessionRepository
                    .findByUserIdAndInterviewIdAndStatus(userId, interviewId, SessionStatus.ACTIVE);

            if (existingSession.isPresent()) {
                log.warn("User already has active session for this interview");
                throw new RuntimeException("You already have an active session for this interview");
            }

            // Create new session
            InterviewSession session = InterviewSession.builder()
                    .user(user)
                    .interview(interview)
                    .status(SessionStatus.ACTIVE)
                    .sessionToken(UUID.randomUUID().toString())
                    .startedAt(LocalDateTime.now())
                    .totalQuestionsAnswered(0)
                    .totalQuestionsEvaluated(0)
                    .overallScore(0)
                    .build();

            session = sessionRepository.save(session);

            log.info("Interview session created with ID: {}, token: {}", session.getId(), session.getSessionToken());

            // Generate first question
            generateNextQuestion(session);

            return new InterviewSessionDto(session);

        } catch (Exception e) {
            log.error("Failed to start interview: ", e);
            throw new RuntimeException("Failed to start interview: " + e.getMessage());
        }
    }

    /**
     * Sonrakı suali yaratdı və gönder
     */
    @Transactional
    public void generateNextQuestion(InterviewSession session) {
        try {
            log.debug("Generating next question for session: {}", session.getId());

            // Check if max questions reached
            if (session.getQuestions().size() >= maxQuestions) {
                log.info("Max questions reached for session: {}", session.getId());
                completeSession(session);
                return;
            }

            // Get all interview questions
            Interview interview = session.getInterview();
            List<Question> allQuestions = interview.getQuestions();

            if (allQuestions.isEmpty()) {
                throw new RuntimeException("Interview has no questions");
            }

            // Get next unused question
            Question nextQuestion = allQuestions.get(session.getQuestions().size());

            // Create interview question
            InterviewQuestion iq = InterviewQuestion.builder()
                    .session(session)
                    .question(nextQuestion)
                    .questionOrder(session.getQuestions().size() + 1)
                    .status(AnswerStatus.PENDING)
                    .askedAt(LocalDateTime.now())
                    .build();

            questionRepository.save(iq);
            session.addQuestion(iq);

            log.debug("Question created: order={}, questionId={}", iq.getQuestionOrder(), nextQuestion.getId());

            // Generate audio for question
            String audioUrl = textToSpeechService.synthesizeAndUpload(nextQuestion.getTitle());

            // Save audio record
            SessionAudio questionAudio = SessionAudio.builder()
                    .session(session)
                    .question(iq)
                    .audioType(AudioType.QUESTION)
                    .audioUrl(audioUrl)
                    .contentType("audio/mp3")
                    .fileSizeBytes(0L)
                    .durationSeconds(0)
                    .createdAt(LocalDateTime.now())
                    .processingStatus("COMPLETED")
                    .build();

            audioRepository.save(questionAudio);

            log.info("Question audio generated and saved. URL: {}", audioUrl);

        } catch (Exception e) {
            log.error("Failed to generate next question: ", e);
            throw new RuntimeException("Failed to generate question: " + e.getMessage());
        }
    }

    /**
     * User cavabı qəbul et
     */
    @Transactional
    public void submitAnswer(String sessionToken, String audioUrl, Long answerDuration) {
        try {
            log.info("Submitting answer for session: {}", sessionToken);

            // Get session
            InterviewSession session = sessionRepository.findBySessionToken(sessionToken)
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            if (session.getStatus() != SessionStatus.ACTIVE) {
                throw new RuntimeException("Session is not active");
            }

            // Get pending question
            InterviewQuestion currentQuestion = questionRepository
                    .findNextPendingQuestion(session.getId())
                    .orElseThrow(() -> new RuntimeException("No pending question"));

            // Save audio
            SessionAudio answerAudio = SessionAudio.builder()
                    .session(session)
                    .question(currentQuestion)
                    .audioType(AudioType.ANSWER)
                    .audioUrl(audioUrl)
                    .contentType("audio/webm")
                    .fileSizeBytes(0L)
                    .durationSeconds(answerDuration.intValue())
                    .createdAt(LocalDateTime.now())
                    .processingStatus("PROCESSING")
                    .build();

            audioRepository.save(answerAudio);

            log.debug("Answer audio saved. URL: {}", audioUrl);

            // Transcribe audio
            String transcript = speechToTextService.transcribeAudio(audioUrl);

            currentQuestion.setUserTranscript(transcript);
            currentQuestion.setAnsweredAt(LocalDateTime.now());
            currentQuestion.setAnswerDurationSeconds(answerDuration.intValue());
            currentQuestion.setStatus(AnswerStatus.PENDING);

            questionRepository.save(currentQuestion);

            log.info("Answer transcribed. Text: {}", transcript.substring(0, Math.min(100, transcript.length())));

            // Evaluate answer
            evaluateAnswer(currentQuestion, session);

        } catch (Exception e) {
            log.error("Failed to submit answer: ", e);
            throw new RuntimeException("Failed to submit answer: " + e.getMessage());
        }
    }

    /**
     * Cavabı qiymətləndir
     */
    @Transactional
    public void evaluateAnswer(InterviewQuestion question, InterviewSession session) {
        try {
            log.info("Evaluating answer for question: {}", question.getId());

            // Evaluate using AI
            evaluationService.evaluateAnswer(question);

            // Update question status
            question.setStatus(AnswerStatus.EVALUATED);
            question.setEvaluatedAt(LocalDateTime.now());

            questionRepository.save(question);

            // Update session stats
            session.setTotalQuestionsAnswered(session.getAnsweredQuestionsCount());
            session.setTotalQuestionsEvaluated(session.getEvaluatedQuestionsCount());
            session.calculateOverallScore();

            sessionRepository.save(session);

            log.info("Answer evaluated. Score: {}", question.getOverallScore());

        } catch (Exception e) {
            log.error("Failed to evaluate answer: ", e);
            throw new RuntimeException("Failed to evaluate answer: " + e.getMessage());
        }
    }

    /**
     * Interview session'ı tamamla
     */
    @Transactional
    public void completeSession(InterviewSession session) {
        try {
            log.info("Completing interview session: {}", session.getId());

            session.setStatus(SessionStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());
            session.calculateOverallScore();

            sessionRepository.save(session);

            log.info("Session completed. Overall score: {}", session.getOverallScore());

        } catch (Exception e) {
            log.error("Failed to complete session: ", e);
            throw new RuntimeException("Failed to complete session: " + e.getMessage());
        }
    }

    /**
     * Session'u pause et
     */
    @Transactional
    public void pauseSession(String sessionToken) {
        try {
            log.info("Pausing session: {}", sessionToken);

            InterviewSession session = sessionRepository.findBySessionToken(sessionToken)
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            session.setStatus(SessionStatus.PAUSED);
            session.setPausedAt(LocalDateTime.now());

            sessionRepository.save(session);

            log.info("Session paused");

        } catch (Exception e) {
            log.error("Failed to pause session: ", e);
            throw new RuntimeException("Failed to pause session: " + e.getMessage());
        }
    }

    /**
     * Session'u resume et
     */
    @Transactional
    public void resumeSession(String sessionToken) {
        try {
            log.info("Resuming session: {}", sessionToken);

            InterviewSession session = sessionRepository.findBySessionToken(sessionToken)
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            if (session.getStatus() != SessionStatus.PAUSED) {
                throw new RuntimeException("Session is not paused");
            }

            session.setStatus(SessionStatus.ACTIVE);
            session.setPausedAt(null);

            sessionRepository.save(session);

            log.info("Session resumed");

        } catch (Exception e) {
            log.error("Failed to resume session: ", e);
            throw new RuntimeException("Failed to resume session: " + e.getMessage());
        }
    }

    /**
     * Session'u al
     */
    @Transactional(readOnly = true)
    public InterviewSession getSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    /**
     * Session'u token'dən al
     */
    @Transactional(readOnly = true)
    public InterviewSession getSessionByToken(String sessionToken) {
        return sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    /**
     * Session progress al
     */
    @Transactional(readOnly = true)
    public SessionProgressDto getSessionProgress(Long sessionId) {
        try {
            InterviewSession session = getSession(sessionId);

            return SessionProgressDto.builder()
                    .sessionId(session.getId())
                    .currentQuestionNumber(session.getTotalQuestionsAnswered() + 1)
                    .totalQuestions(maxQuestions)
                    .totalAnswered(session.getTotalQuestionsAnswered())
                    .totalEvaluated(session.getTotalQuestionsEvaluated())
                    .currentScore(session.getOverallScore())
                    .status(session.getStatus().name())
                    .startedAt(session.getStartedAt())
                    .build();

        } catch (Exception e) {
            log.error("Failed to get session progress: ", e);
            throw new RuntimeException("Failed to get progress: " + e.getMessage());
        }
    }

    /**
     * Session report al
     */
    @Transactional(readOnly = true)
    public SessionReportDto getSessionReport(Long sessionId) {
        try {
            InterviewSession session = getSession(sessionId);

            List<AnswerDetailDto> answers = session.getQuestions().stream()
                    .map(q -> new AnswerDetailDto(
                            q.getQuestion().getTitle(),
                            q.getUserTranscript(),
                            q.getOverallScore(),
                            q.getAiFeedback(),
                            q.getRelevanceScore(),
                            q.getCompletenessScore(),
                            q.getClarityScore(),
                            q.getConfidenceScore()
                    ))
                    .toList();

            LocalDateTime completedAt = session.getCompletedAt() != null ?
                    session.getCompletedAt() : LocalDateTime.now();

            int durationMinutes = (int) ChronoUnit.MINUTES
                    .between(session.getStartedAt(), completedAt);

            return SessionReportDto.builder()
                    .sessionId(session.getId())
                    .overallScore(session.getOverallScore())
                    .totalQuestions(session.getQuestions().size())
                    .answers(answers)
                    .startedAt(session.getStartedAt())
                    .completedAt(session.getCompletedAt())
                    .durationMinutes(durationMinutes)
                    .build();

        } catch (Exception e) {
            log.error("Failed to get session report: ", e);
            throw new RuntimeException("Failed to get report: " + e.getMessage());
        }
    }

    /**
     * Current question al
     */
    @Transactional(readOnly = true)
    public CurrentQuestionDto getCurrentQuestion(Long sessionId) {
        try {
            getSession(sessionId);

            // Get next pending question
            var pendingQuestion = questionRepository
                    .findNextPendingQuestion(sessionId);

            if (pendingQuestion.isEmpty()) {
                return null;
            }

            InterviewQuestion question = pendingQuestion.get();
            Question q = question.getQuestion();

            // Get audio URL
            var questionAudio = audioRepository
                    .findByQuestionIdAndAudioType(question.getId(), AudioType.QUESTION);

            String audioUrl = questionAudio.isPresent() ?
                    questionAudio.get().getAudioUrl() : null;

            return CurrentQuestionDto.builder()
                    .questionId(question.getId())
                    .questionOrder(question.getQuestionOrder())
                    .questionText(q.getTitle())
                    .questionAudioUrl(audioUrl)
                    .difficulty(q.getDifficulty().name())
                    .status(question.getStatus().name())
                    .build();

        } catch (Exception e) {
            log.error("Failed to get current question: ", e);
            throw new RuntimeException("Failed to get current question: " + e.getMessage());
        }
    }
}