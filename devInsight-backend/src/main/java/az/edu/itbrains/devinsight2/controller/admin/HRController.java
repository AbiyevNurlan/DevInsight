package az.edu.itbrains.devinsight2.controller.admin;

import az.edu.itbrains.devinsight2.dto.template.TemplateStatisticsDto;
import az.edu.itbrains.devinsight2.model.interview.InterviewTemplate;
import az.edu.itbrains.devinsight2.model.question.QuestionBank;
import az.edu.itbrains.devinsight2.model.question.TemplateQuestion;
import az.edu.itbrains.devinsight2.service.interview.InterviewTemplateService;
import az.edu.itbrains.devinsight2.service.question.QuestionBankService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hr")
@PreAuthorize("hasAnyRole('HR', 'ADMIN', 'RECRUITER', 'INTERVIEWER')")
@RequiredArgsConstructor
@Slf4j
public class HRController {
    
    private final InterviewTemplateService templateService;
    private final QuestionBankService questionService;
    
    // ========== TEMPLATES ==========
    
    @GetMapping("/templates")
    public ResponseEntity<List<InterviewTemplate>> getTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String difficulty
    ) {
        log.info("Fetching templates - category: {}, tags: {}, difficulty: {}", category, tags, difficulty);
        
        List<InterviewTemplate> templates;
        if (category != null || tags != null || difficulty != null) {
            templates = templateService.getFilteredTemplates(category, tags, difficulty);
        } else {
            templates = templateService.getAllTemplates();
        }
        
        return ResponseEntity.ok(templates);
    }
    
    @PostMapping("/templates")
    public ResponseEntity<InterviewTemplate> createTemplate(@RequestBody Map<String, Object> request) {
        log.info("Creating new interview template: {}", request);
        
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        String difficulty = (String) request.get("difficulty");
        String category = (String) request.get("category");
        Integer totalDurationMinutes = (Integer) request.get("totalDurationMinutes");
        Integer maxScore = (Integer) request.get("maxScore");
        
        @SuppressWarnings("unchecked")
        List<String> tagsList = (List<String>) request.get("tags");
        String[] tags = tagsList != null ? tagsList.toArray(new String[0]) : new String[0];
        
        @SuppressWarnings("unchecked")
        List<Long> questionIds = (List<Long>) request.get("questionIds");
        
        @SuppressWarnings("unchecked")
        List<Integer> maxScores = (List<Integer>) request.get("maxScores");
        
        InterviewTemplate template = templateService.createTemplate(
            name, description, difficulty, category, totalDurationMinutes, maxScore, tags, questionIds, maxScores
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }
    
    @GetMapping("/templates/{id}")
    public ResponseEntity<InterviewTemplate> getTemplate(@PathVariable Long id) {
        log.info("Fetching template: {}", id);
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }
    
    @PutMapping("/templates/{id}")
    public ResponseEntity<InterviewTemplate> updateTemplate(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        log.info("Updating template: {}", id);
        
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        String difficulty = (String) request.get("difficulty");
        
        InterviewTemplate template = templateService.updateTemplate(id, name, description, difficulty);
        return ResponseEntity.ok(template);
    }
    
    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        log.info("Deleting template: {}", id);
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/templates/{id}/clone")
    public ResponseEntity<InterviewTemplate> cloneTemplate(@PathVariable Long id) {
        log.info("Cloning template: {}", id);
        InterviewTemplate cloned = templateService.cloneTemplate(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(cloned);
    }
    
    @GetMapping("/templates/{id}/questions")
    public ResponseEntity<List<TemplateQuestion>> getTemplateQuestions(@PathVariable Long id) {
        log.info("Fetching questions for template: {}", id);
        return ResponseEntity.ok(templateService.getTemplateQuestions(id));
    }
    
    @GetMapping("/templates/{id}/statistics")
    public ResponseEntity<TemplateStatisticsDto> getTemplateStatistics(@PathVariable Long id) {
        log.info("Fetching statistics for template: {}", id);
        TemplateStatisticsDto stats = templateService.getTemplateStatistics(id);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/templates/categories")
    public ResponseEntity<List<String>> getTemplateCategories() {
        log.info("Fetching template categories");
        List<String> categories = Arrays.asList(
            "Frontend",
            "Backend",
            "Full-stack",
            "DevOps",
            "Data Science",
            "Mobile",
            "QA/Testing",
            "System Design",
            "General"
        );
        return ResponseEntity.ok(categories);
    }
    
    // ========== QUESTIONS ==========
    
    @GetMapping("/questions")
    public ResponseEntity<List<QuestionBank>> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty
    ) {
        log.info("Fetching questions - category: {}, difficulty: {}", category, difficulty);
        
        List<QuestionBank> questions;
        if (category != null && !category.isEmpty()) {
            questions = questionService.getQuestionsByCategory(category);
        } else if (difficulty != null && !difficulty.isEmpty()) {
            questions = questionService.getQuestionsByDifficulty(difficulty);
        } else {
            questions = questionService.getAllQuestions();
        }
        
        return ResponseEntity.ok(questions);
    }
    
    @PostMapping("/questions")
    public ResponseEntity<QuestionBank> createQuestion(@RequestBody Map<String, Object> request) {
        log.info("Creating new question");
        
        String category = (String) request.get("category");
        String subcategory = (String) request.get("subcategory");
        String difficulty = (String) request.get("difficulty");
        String questionText = (String) request.get("questionText");
        String expectedKeywords = (String) request.get("expectedKeywords");
        Integer suggestedDuration = (Integer) request.get("suggestedDurationMinutes");
        
        @SuppressWarnings("unchecked")
        String[] tags = request.get("tags") != null ? 
            ((List<String>) request.get("tags")).toArray(new String[0]) : 
            new String[0];
        
        QuestionBank question = questionService.createQuestion(
            category, subcategory, difficulty, questionText, expectedKeywords, suggestedDuration, tags
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(question);
    }
    
    @GetMapping("/questions/{id}")
    public ResponseEntity<QuestionBank> getQuestion(@PathVariable Long id) {
        log.info("Fetching question: {}", id);
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }
    
    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionBank> updateQuestion(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        log.info("Updating question: {}", id);
        
        String category = (String) request.get("category");
        String difficulty = (String) request.get("difficulty");
        String questionText = (String) request.get("questionText");
        String expectedKeywords = (String) request.get("expectedKeywords");
        
        QuestionBank question = questionService.updateQuestion(id, category, difficulty, questionText, expectedKeywords);
        return ResponseEntity.ok(question);
    }
    
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        log.info("Deleting question: {}", id);
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/questions/search")
    public ResponseEntity<List<QuestionBank>> searchQuestions(@RequestParam String q) {
        log.info("Searching questions: {}", q);
        return ResponseEntity.ok(questionService.searchQuestions(q));
    }
    
    @PostMapping("/questions/{id}/rate")
    public ResponseEntity<QuestionBank> rateQuestion(@PathVariable Long id, @RequestParam Double rating) {
        log.info("Rating question {}: {}", id, rating);
        return ResponseEntity.ok(questionService.rateQuestion(id, rating));
    }
}
