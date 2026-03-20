package az.edu.itbrains.devinsight2.service.question;

import az.edu.itbrains.devinsight2.dto.question.CreateQuestionRequest;
import az.edu.itbrains.devinsight2.dto.question.QuestionResponse;
import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.model.question.QuestionType;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.question.QuestionRepository;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final InterviewRepository interviewRepository;
    private final UserService userService;

    @Transactional
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        User currentUser = userService.getCurrentUser();
        
        log.info("Creating new question: {} by user: {}", request.getTitle(), currentUser.getEmail());

        Question question = Question.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .difficulty(request.getDifficulty())
                .tags(request.getTags())
                .programmingLanguage(request.getProgrammingLanguage())
                .starterCode(request.getStarterCode())
                .solution(request.getSolution())
                .testCases(request.getTestCases())
                .options(request.getOptions() != null ? request.getOptions() : new java.util.ArrayList<>())
                .correctAnswer(request.getCorrectAnswer())
                .evaluationCriteria(request.getEvaluationCriteria())
                .maxPoints(request.getMaxPoints())
                .timeLimit(request.getTimeLimit())
                .createdBy(currentUser)
                .build();

        question = questionRepository.save(question);

        // Associate with interview if provided
        if (request.getInterviewId() != null) {
            Interview interview = interviewRepository.findById(request.getInterviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + request.getInterviewId()));
            
            interview.getQuestions().add(question);
            interviewRepository.save(interview);
            
            log.info("Question {} associated with interview {}", question.getId(), interview.getId());
        }

        log.info("Question created successfully with id: {}", question.getId());
        return mapToResponse(question);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getAllQuestions() {
        User currentUser = userService.getCurrentUser();
        
        log.info("Fetching all questions for user: {}", currentUser.getEmail());
        
        List<Question> questions;
        
        // Admin sees all questions
        if (currentUser.getRole() == UserRole.ADMIN) {
            questions = questionRepository.findAllWithCreatedBy();
        } 
        // HR, RECRUITER, and INTERVIEWER see questions based on their company/created
        else if (currentUser.getRole() == UserRole.HR || 
                 currentUser.getRole() == UserRole.RECRUITER ||
                 currentUser.getRole() == UserRole.INTERVIEWER) {
            // For now, show all questions to these roles
            // In production, you might want to filter by company
            questions = questionRepository.findAllWithCreatedBy();
        } 
        // Candidate cannot access questions directly
        else {
            log.warn("Candidate {} attempted to access questions directly", currentUser.getEmail());
            throw new SecurityException("Candidates cannot access questions directly");
        }

        return questions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long id) {
        Question question = questionRepository.findByIdWithCreatedBy(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        
        return mapToResponse(question);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, CreateQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());
        question.setType(request.getType());
        question.setDifficulty(request.getDifficulty());
        question.setTags(request.getTags());
        question.setProgrammingLanguage(request.getProgrammingLanguage());
        question.setStarterCode(request.getStarterCode());
        question.setSolution(request.getSolution());
        question.setTestCases(request.getTestCases());
        question.setOptions(request.getOptions() != null ? request.getOptions() : new java.util.ArrayList<>());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setEvaluationCriteria(request.getEvaluationCriteria());
        question.setMaxPoints(request.getMaxPoints());
        question.setTimeLimit(request.getTimeLimit());

        question = questionRepository.save(question);
        
        log.info("Question {} updated successfully", id);
        return mapToResponse(question);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        questionRepository.delete(question);
        log.info("Question {} deleted successfully", id);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByType(QuestionType type) {
        return questionRepository.findByType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private QuestionResponse mapToResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .title(question.getTitle())
                .description(question.getDescription())
                .type(question.getType())
                .difficulty(question.getDifficulty())
                .tags(question.getTags())
                .programmingLanguage(question.getProgrammingLanguage())
                .starterCode(question.getStarterCode())
                .evaluationCriteria(question.getEvaluationCriteria())
                .maxPoints(question.getMaxPoints())
                .timeLimit(question.getTimeLimit())
                .createdByName(question.getCreatedBy() != null ? question.getCreatedBy().getFullName() : "Unknown")
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
