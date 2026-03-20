package az.edu.itbrains.devinsight2.service.question;

import az.edu.itbrains.devinsight2.model.question.QuestionBank;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.question.QuestionBankRepository;
import az.edu.itbrains.devinsight2.service.audit.AuditLogService;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class QuestionBankService {
    
    private final QuestionBankRepository questionRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    
    /**
     * Create new question in question bank
     */
    public QuestionBank createQuestion(String category, String subcategory, String difficulty, 
                                      String questionText, String expectedKeywords, 
                                      Integer suggestedDuration, String[] tags) {
        log.info("Creating new question: {}", questionText.substring(0, Math.min(50, questionText.length())));
        
        User currentUser = userService.getCurrentUser();
        
        if (currentUser.getCompany() == null) {
            throw new RuntimeException("User must belong to a company to create questions");
        }
        
        QuestionBank question = QuestionBank.builder()
            .category(category)
            .subcategory(subcategory)
            .difficulty(difficulty)
            .questionText(questionText)
            .expectedKeywords(expectedKeywords)
            .suggestedDurationMinutes(suggestedDuration)
            .tags(tags)
            .usageCount(0)
            .companyId(currentUser.getCompany().getId())
            .createdBy(currentUser)
            .build();
        
        QuestionBank saved = questionRepository.save(question);
        
        auditLogService.logCreate("QUESTION", saved.getId(), saved);
        
        log.info("Question created successfully: {}", saved.getId());
        return saved;
    }
    
    /**
     * Get questions by category
     */
    public List<QuestionBank> getQuestionsByCategory(String category) {
        return questionRepository.findByCategory(category);
    }
    
    /**
     * Get questions by difficulty
     */
    public List<QuestionBank> getQuestionsByDifficulty(String difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }
    
    /**
     * Get questions by subcategory
     */
    public List<QuestionBank> getQuestionsBySubcategory(String subcategory) {
        return questionRepository.findBySubcategory(subcategory);
    }
    
    /**
     * Search questions by text
     */
    public List<QuestionBank> searchQuestions(String query) {
        return questionRepository.searchByText(query);
    }
    
    /**
     * Get all questions
     */
    public List<QuestionBank> getAllQuestions() {
        return questionRepository.findAll();
    }
    
    /**
     * Get question by ID
     */
    public QuestionBank getQuestionById(Long id) {
        return questionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Question not found: " + id));
    }
    
    /**
     * Update question
     */
    public QuestionBank updateQuestion(Long id, String category, String difficulty, String questionText, String expectedKeywords) {
        QuestionBank question = getQuestionById(id);
        
        QuestionBank oldQuestion = QuestionBank.builder()
            .category(question.getCategory())
            .difficulty(question.getDifficulty())
            .questionText(question.getQuestionText())
            .expectedKeywords(question.getExpectedKeywords())
            .build();
        
        question.setCategory(category);
        question.setDifficulty(difficulty);
        question.setQuestionText(questionText);
        question.setExpectedKeywords(expectedKeywords);
        
        QuestionBank updated = questionRepository.save(question);
        
        auditLogService.logUpdate("QUESTION", id, oldQuestion, updated);
        
        return updated;
    }
    
    /**
     * Delete question
     */
    public void deleteQuestion(Long id) {
        QuestionBank question = getQuestionById(id);
        questionRepository.delete(question);
        
        auditLogService.logDelete("QUESTION", id, question);
        
        log.info("Question deleted: {}", id);
    }
    
    /**
     * Rate question (1-5 scale)
     */
    public QuestionBank rateQuestion(Long id, Double rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        QuestionBank question = getQuestionById(id);
        QuestionBank oldQuestion = QuestionBank.builder()
            .rating(question.getRating())
            .usageCount(question.getUsageCount())
            .build();
        
        question.setRating(BigDecimal.valueOf(rating));
        question.setUsageCount(question.getUsageCount() + 1);
        
        QuestionBank updated = questionRepository.save(question);
        
        auditLogService.logUpdate("QUESTION", id, oldQuestion, updated);
        
        return updated;
    }
}
