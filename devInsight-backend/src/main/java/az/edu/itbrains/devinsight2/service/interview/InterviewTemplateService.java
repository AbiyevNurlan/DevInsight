package az.edu.itbrains.devinsight2.service.interview;

import az.edu.itbrains.devinsight2.dto.template.TemplateStatisticsDto;
import az.edu.itbrains.devinsight2.model.interview.InterviewTemplate;
import az.edu.itbrains.devinsight2.model.question.QuestionBank;
import az.edu.itbrains.devinsight2.model.question.TemplateQuestion;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.interview.InterviewTemplateRepository;
import az.edu.itbrains.devinsight2.repository.question.QuestionBankRepository;
import az.edu.itbrains.devinsight2.repository.interview.TemplateQuestionRepository;
import az.edu.itbrains.devinsight2.service.audit.AuditLogService;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class InterviewTemplateService {
    
    private final InterviewTemplateRepository templateRepository;
    private final TemplateQuestionRepository templateQuestionRepository;
    private final QuestionBankRepository questionRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    
    /**
     * Create interview template with questions
     */
    public InterviewTemplate createTemplate(
            String name, 
            String description, 
            String difficulty, 
            String category,
            Integer totalDurationMinutes,
            Integer maxScore,
            String[] tags,
            List<Long> questionIds, 
            List<Integer> maxScores
    ) {
        log.info("Creating new interview template: {}", name);
        
        User currentUser = userService.getCurrentUser();
        
        // Use provided values or defaults
        if (totalDurationMinutes == null) {
            totalDurationMinutes = questionIds != null ? questionIds.size() * 15 : 60;
        }
        
        if (maxScore == null) {
            maxScore = maxScores != null && !maxScores.isEmpty() 
                ? maxScores.stream().mapToInt(Integer::intValue).sum() 
                : 100;
        }
        
        InterviewTemplate template = InterviewTemplate.builder()
            .name(name)
            .description(description)
            .difficulty(difficulty)
            .category(category)
            .totalDurationMinutes(totalDurationMinutes)
            .maxScore(maxScore)
            .tags(tags)
            .isActive(true)
            .usageCount(0)
            .createdBy(currentUser)
            .build();
        
        InterviewTemplate saved = templateRepository.save(template);
        
        // Add questions to template (if any)
        if (questionIds != null && !questionIds.isEmpty()) {
            for (int i = 0; i < questionIds.size(); i++) {
                Long questionId = questionIds.get(i);
                QuestionBank question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
                
                TemplateQuestion tq = TemplateQuestion.builder()
                    .template(saved)
                    .question(question)
                    .questionOrder(i + 1)
                    .maxScore(maxScores != null ? maxScores.get(i) : 10)
                    .build();
                
                templateQuestionRepository.save(tq);
            }
        }
        
        auditLogService.logCreate("INTERVIEW_TEMPLATE", saved.getId(), saved);
        
        log.info("Interview template created successfully: {}", saved.getId());
        return saved;
    }
    
    /**
     * Get all templates for current company
     */
    public List<InterviewTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }
    
    /**
     * Get template by ID
     */
    public InterviewTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Template not found: " + id));
    }
    
    /**
     * Update template
     */
    public InterviewTemplate updateTemplate(Long id, String name, String description, String difficulty) {
        InterviewTemplate template = getTemplateById(id);
        
        InterviewTemplate oldTemplate = InterviewTemplate.builder()
            .name(template.getName())
            .description(template.getDescription())
            .difficulty(template.getDifficulty())
            .build();
        
        template.setName(name);
        template.setDescription(description);
        template.setDifficulty(difficulty);
        
        InterviewTemplate updated = templateRepository.save(template);
        
        auditLogService.logUpdate("INTERVIEW_TEMPLATE", id, oldTemplate, updated);
        
        return updated;
    }
    
    /**
     * Delete template
     */
    public void deleteTemplate(Long id) {
        InterviewTemplate template = getTemplateById(id);
        templateRepository.delete(template);
        
        auditLogService.logDelete("INTERVIEW_TEMPLATE", id, template);
        
        log.info("Interview template deleted: {}", id);
    }
    
    /**
     * Clone template
     */
    public InterviewTemplate cloneTemplate(Long templateId) {
        InterviewTemplate original = getTemplateById(templateId);
        
        User currentUser = userService.getCurrentUser();
        
        InterviewTemplate cloned = InterviewTemplate.builder()
            .name(original.getName() + " (Clone)")
            .description(original.getDescription())
            .difficulty(original.getDifficulty())
            .totalDurationMinutes(original.getTotalDurationMinutes())
            .maxScore(original.getMaxScore())
            .isActive(true)
            .createdBy(currentUser)
            .build();
        
        InterviewTemplate savedClone = templateRepository.save(cloned);
        
        // Clone questions
        List<TemplateQuestion> originalQuestions = templateQuestionRepository.findByTemplateId(templateId);
        for (TemplateQuestion tq : originalQuestions) {
            TemplateQuestion newTq = TemplateQuestion.builder()
                .template(savedClone)
                .question(tq.getQuestion())
                .questionOrder(tq.getQuestionOrder())
                .maxScore(tq.getMaxScore())
                .timeLimitMinutes(tq.getTimeLimitMinutes())
                .build();
            
            templateQuestionRepository.save(newTq);
        }
        
        auditLogService.logCreate("INTERVIEW_TEMPLATE", savedClone.getId(), savedClone);
        
        return savedClone;
    }
    
    /**
     * Get template questions
     */
    public List<TemplateQuestion> getTemplateQuestions(Long templateId) {
        return templateQuestionRepository.findByTemplateId(templateId);
    }
    
    /**
     * Get filtered templates by category, tags, difficulty
     */
    public List<InterviewTemplate> getFilteredTemplates(String category, String tags, String difficulty) {
        List<InterviewTemplate> allTemplates = templateRepository.findAll();
        return allTemplates.stream()
            .filter(t -> category == null || category.isEmpty() || category.equalsIgnoreCase(t.getCategory()))
            .filter(t -> difficulty == null || difficulty.isEmpty() || difficulty.equalsIgnoreCase(t.getDifficulty()))
            .filter(t -> tags == null || tags.isEmpty() || hasMatchingTag(t, tags))
            .toList();
    }
    
    private boolean hasMatchingTag(InterviewTemplate template, String tags) {
        if (template.getTags() == null || template.getTags().length == 0) {
            return false;
        }
        String[] searchTags = tags.split(",");
        for (String searchTag : searchTags) {
            for (String templateTag : template.getTags()) {
                if (templateTag.trim().equalsIgnoreCase(searchTag.trim())) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Get template statistics
     */
    public TemplateStatisticsDto getTemplateStatistics(Long templateId) {
        InterviewTemplate template = getTemplateById(templateId);
        
        // Calculate average score from submissions for this template
        double averageScore = 0.0;
        long totalCandidates = 0L;
        
        try {
            // Placeholder: Calculate from actual interview data
            // In a real implementation, you would query interviews by template
            // and calculate the average score from their submissions
            averageScore = 0.0;
            
            // Placeholder: Count candidates who took interviews with this template
            // In a real implementation, you would count unique users from interviews
            totalCandidates = 0L;
        } catch (Exception e) {
            // Log error and continue with default values
            log.warn("Error calculating template statistics for template {}: {}", templateId, e.getMessage());
        }
        
        return TemplateStatisticsDto.builder()
            .templateId(template.getId())
            .templateName(template.getName())
            .usageCount(template.getUsageCount() != null ? template.getUsageCount() : 0)
            .lastUsedDate(template.getLastUsedDate())
            .averageScore(averageScore)
            .totalCandidates(totalCandidates)
            .build();
    }
}
