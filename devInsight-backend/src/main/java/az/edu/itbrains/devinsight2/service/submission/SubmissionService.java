package az.edu.itbrains.devinsight2.service.submission;

import az.edu.itbrains.devinsight2.dto.submission.QuestionAnswerResponseDto;
import az.edu.itbrains.devinsight2.dto.submission.SubmissionResultDto;
import az.edu.itbrains.devinsight2.dto.submission.SubmitAnswerDto;
import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.model.submission.AnswerStatus;
import az.edu.itbrains.devinsight2.model.submission.InterviewSubmission;
import az.edu.itbrains.devinsight2.model.submission.QuestionAnswer;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.question.QuestionRepository;
import az.edu.itbrains.devinsight2.repository.submission.InterviewSubmissionRepository;
import az.edu.itbrains.devinsight2.repository.submission.QuestionAnswerRepository;
import az.edu.itbrains.devinsight2.security.CurrentUserService;
import az.edu.itbrains.devinsight2.service.grading.TextSimilarityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final InterviewSubmissionRepository submissionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final TextSimilarityService textSimilarityService;
    private final CurrentUserService currentUserService;

    /**
     * Submit answers for an interview with duplicate prevention.
     * Uses SERIALIZABLE isolation to prevent race conditions.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public SubmissionResultDto submitAnswers(Long interviewId, List<SubmitAnswerDto> answers) {
        log.info("Starting submission process for interview: {} with {} answers", interviewId, answers.size());

        // Get current user
        User currentUser = currentUserService.getCurrentUser();
        Long userId = currentUser.getId();
        
        // Get interview
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        // Check if user already has a submission for this interview (with lock)
        Optional<InterviewSubmission> existingSubmission = submissionRepository
                .findByInterviewAndUser(interviewId, userId);

        InterviewSubmission submission;
        boolean isUpdate = false;
        
        if (existingSubmission.isPresent()) {
            submission = existingSubmission.get();
            isUpdate = true;
            log.info("Found existing submission ID {} for user {} and interview {}. Updating...", 
                    submission.getId(), userId, interviewId);
            
            // Clear existing answers for re-submission
            List<QuestionAnswer> existingAnswers = questionAnswerRepository.findBySubmissionId(submission.getId());
            if (!existingAnswers.isEmpty()) {
                log.info("Deleting {} existing answers for re-submission", existingAnswers.size());
                questionAnswerRepository.deleteAll(existingAnswers);
                questionAnswerRepository.flush(); // Ensure deletion is committed
            }
        } else {
            // Create new submission with duplicate check
            try {
                submission = InterviewSubmission.builder()
                        .interview(interview)
                        .submittedBy(currentUser)
                        .status(SubmissionStatus.IN_PROGRESS)
                        .submittedAt(LocalDateTime.now())
                        .build();
                submission = submissionRepository.saveAndFlush(submission);
                log.info("Created new submission with ID: {}", submission.getId());
            } catch (DataIntegrityViolationException e) {
                // Race condition: another thread created submission first
                log.warn("Duplicate submission detected, fetching existing submission");
                submission = submissionRepository.findByInterviewAndUser(interviewId, userId)
                        .orElseThrow(() -> new RuntimeException("Submission creation failed"));
                isUpdate = true;
            }
        }

        // Process answers with duplicate prevention
        List<QuestionAnswer> questionAnswers = new ArrayList<>();
        double totalScore = 0.0;
        double totalMaxScore = 0.0;
        int totalQuestions = answers.size();

        for (SubmitAnswerDto answerDto : answers) {
            // Get question
            Question question = questionRepository.findById(answerDto.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + answerDto.getQuestionId()));

            // Check for existing answer to this question
            Optional<QuestionAnswer> existingAnswer = questionAnswerRepository
                    .findBySubmissionAndQuestion(submission.getId(), question.getId());
            
            if (existingAnswer.isPresent()) {
                log.info("Updating existing answer for question {}", question.getId());
                questionAnswerRepository.delete(existingAnswer.get());
                questionAnswerRepository.flush();
            }

            // Calculate similarity and points
            String correctAnswer = question.getCorrectAnswer();
            String userAnswer = answerDto.getAnswer();
            int maxPoints = question.getMaxPoints() != null ? question.getMaxPoints() : 10;
            
            double similarity = textSimilarityService.calculateSimilarity(userAnswer, correctAnswer);
            double points = textSimilarityService.calculatePoints(similarity, maxPoints);
            String feedback = textSimilarityService.generateFeedback(similarity);

            log.info("=== Scoring for Question {} ===", question.getId());
            log.info("User Answer: '{}'", userAnswer);
            log.info("Correct Answer: '{}'", correctAnswer);
            log.info("Similarity: {}%, Points: {}/{}", similarity, points, maxPoints);

            // Create new question answer
            QuestionAnswer questionAnswer = QuestionAnswer.builder()
                    .submission(submission)
                    .question(question)
                    .userAnswer(userAnswer)
                    .similarityScore(similarity)
                    .pointsEarned(points)
                    .maxPoints(maxPoints)
                    .feedback(feedback)
                    .status(determineStatus(similarity))
                    .build();

            try {
                questionAnswer = questionAnswerRepository.saveAndFlush(questionAnswer);
                questionAnswers.add(questionAnswer);
                totalScore += points;
                totalMaxScore += maxPoints;
            } catch (DataIntegrityViolationException e) {
                log.warn("Duplicate answer detected for question {}, skipping", question.getId());
                // Fetch existing and use it
                questionAnswer = questionAnswerRepository.findBySubmissionAndQuestion(submission.getId(), question.getId())
                        .orElse(questionAnswer);
                questionAnswers.add(questionAnswer);
                totalScore += questionAnswer.getPointsEarned();
                totalMaxScore += questionAnswer.getMaxPoints();
            }

            log.info("Question {} - Score: {}/{}, Similarity: {}%", 
                    question.getId(), points, maxPoints, similarity);
        }

        // Calculate percentage correctly based on actual max scores
        double percentageScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
        
        // Update submission
        submission.setTotalScore(totalScore);
        submission.setTotalQuestions(totalQuestions);
        submission.setAnsweredQuestions(totalQuestions);
        submission.setPercentageScore(percentageScore);
        submission.setStatus(SubmissionStatus.ANALYZED);
        submission.setSubmittedAt(LocalDateTime.now());
        submission = submissionRepository.save(submission);
        
        log.info("=== Final Score: {}/{} ({}%) [{}] ===", 
                totalScore, totalMaxScore, percentageScore, isUpdate ? "UPDATED" : "NEW");

        // Build result DTO
        return buildSubmissionResultDto(submission, questionAnswers);
    }

    @Transactional(readOnly = true)
    public SubmissionResultDto getSubmissionResults(Long submissionId) {
        log.info("Retrieving submission results for ID: {}", submissionId);

        InterviewSubmission submission = submissionRepository.findByIdWithDetails(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        List<QuestionAnswer> questionAnswers = questionAnswerRepository.findBySubmissionId(submissionId);

        return buildSubmissionResultDto(submission, questionAnswers);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResultDto> getUserSubmissions(Long interviewId) {
        User currentUser = currentUserService.getCurrentUser();
        log.info("Getting submissions for user {} and interview {}", currentUser.getId(), interviewId);

        List<InterviewSubmission> submissions = submissionRepository.findByUserId(currentUser.getId());
        
        return submissions.stream()
                .filter(s -> s.getInterview().getId().equals(interviewId))
                .map(submission -> {
                    List<QuestionAnswer> answers = questionAnswerRepository.findBySubmissionId(submission.getId());
                    return buildSubmissionResultDto(submission, answers);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubmissionResultDto> getInterviewSubmissions(Long interviewId) {
        log.info("Getting all submissions for interview: {}", interviewId);

        List<InterviewSubmission> submissions = submissionRepository.findByInterviewId(interviewId);
        
        return submissions.stream()
                .map(submission -> {
                    List<QuestionAnswer> answers = questionAnswerRepository.findBySubmissionId(submission.getId());
                    return buildSubmissionResultDto(submission, answers);
                })
                .toList();
    }

    /**
     * Get current user's results for a specific interview
     */
    @Transactional(readOnly = true)
    public SubmissionResultDto getMyInterviewResults(Long interviewId) {
        User currentUser = currentUserService.getCurrentUser();
        log.info("Getting results for user {} and interview {}", currentUser.getId(), interviewId);

        Optional<InterviewSubmission> submission = submissionRepository
                .findByInterviewAndUser(interviewId, currentUser.getId());
        
        if (submission.isEmpty()) {
            log.info("No submission found for user {} and interview {}", currentUser.getId(), interviewId);
            return null;
        }
        
        List<QuestionAnswer> answers = questionAnswerRepository.findBySubmissionId(submission.get().getId());
        return buildSubmissionResultDto(submission.get(), answers);
    }

    @Transactional(readOnly = true)
    public SubmissionStatisticsDto getSubmissionStatistics(Long interviewId) {
        log.info("Getting submission statistics for interview: {}", interviewId);

        List<InterviewSubmission> submissions = submissionRepository.findByInterviewId(interviewId);
        
        if (submissions.isEmpty()) {
            return SubmissionStatisticsDto.builder()
                    .totalSubmissions(0)
                    .averageScore(0.0)
                    .highestScore(0.0)
                    .lowestScore(0.0)
                    .build();
        }

        List<Double> scores = submissions.stream()
                .map(InterviewSubmission::getTotalScore)
                .filter(score -> score != null && score > 0)
                .toList();

        if (scores.isEmpty()) {
            return SubmissionStatisticsDto.builder()
                    .totalSubmissions(submissions.size())
                    .averageScore(0.0)
                    .highestScore(0.0)
                    .lowestScore(0.0)
                    .build();
        }

        double averageScore = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double highestScore = scores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double lowestScore = scores.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);

        return SubmissionStatisticsDto.builder()
                .totalSubmissions(submissions.size())
                .averageScore(averageScore)
                .highestScore(highestScore)
                .lowestScore(lowestScore)
                .build();
    }

    private AnswerStatus determineStatus(double similarity) {
        if (similarity >= 0.8) {
            return AnswerStatus.CORRECT;
        } else if (similarity >= 0.5) {
            return AnswerStatus.PARTIAL;
        } else {
            return AnswerStatus.INCORRECT;
        }
    }

    private SubmissionResultDto buildSubmissionResultDto(InterviewSubmission submission, List<QuestionAnswer> questionAnswers) {
        return SubmissionResultDto.builder()
                .submissionId(submission.getId())
                .interviewId(submission.getInterview().getId())
                .interviewTitle(submission.getInterview().getTitle())
                .totalScore(submission.getTotalScore())
                .totalQuestions(submission.getTotalQuestions())
                .answeredQuestions(submission.getAnsweredQuestions())
                .percentageScore(submission.getPercentageScore())
                .status(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .results(questionAnswers.stream()
                        .map(this::buildQuestionAnswerDto)
                        .toList())
                .build();
    }

    private QuestionAnswerResponseDto buildQuestionAnswerDto(QuestionAnswer qa) {
        return QuestionAnswerResponseDto.builder()
                .answerId(qa.getId())
                .questionId(qa.getQuestion().getId())
                .questionTitle(qa.getQuestion().getTitle())
                .userAnswer(qa.getUserAnswer())
                .similarityScore(qa.getSimilarityScore())
                .pointsEarned(qa.getPointsEarned())
                .maxPoints(qa.getMaxPoints())
                .feedback(qa.getFeedback())
                .status(qa.getStatus())
                .build();
    }
}