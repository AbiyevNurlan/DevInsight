package az.edu.itbrains.devinsight2.service.interview;

import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewStatus;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.question.Question;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.question.QuestionRepository;
import az.edu.itbrains.devinsight2.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserService userService;
    private final QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public Interview getInterviewById(Long id) {
        return interviewRepository.findByIdWithCompanyAndCreator(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Interview> getAllInterviews() {
        User currentUser = userService.getCurrentUser();
        
        // Admin sees all interviews
        if (currentUser.getRole() == UserRole.ADMIN) {
            log.info("Admin fetching all interviews");
            return interviewRepository.findAllWithCompanyAndCreator();
        }
        
        // HR, RECRUITER, INTERVIEWER see company interviews or all if no company assigned
        if (currentUser.getRole() == UserRole.HR || 
            currentUser.getRole() == UserRole.RECRUITER ||
            currentUser.getRole() == UserRole.INTERVIEWER) {
            if (currentUser.getCompany() != null) {
                log.info("{} fetching company interviews for companyId: {}", 
                    currentUser.getRole(), currentUser.getCompany().getId());
                return interviewRepository.findByCompanyIdWithCompany(currentUser.getCompany().getId());
            } else {
                log.info("{} user {} has no company assigned, showing all interviews", 
                    currentUser.getRole(), currentUser.getEmail());
                return interviewRepository.findAllWithCompanyAndCreator();
            }
        }
        
        // Candidate sees public/active interviews
        log.info("Candidate fetching public interviews");
        return interviewRepository.findByIsPublicTrueWithCompany();
    }

    @Transactional(readOnly = true)
    public List<Interview> getPublicInterviews() {
        return interviewRepository.findByIsPublicTrueWithCompany();
    }

    @Transactional(readOnly = true)
    public List<Interview> getActiveInterviews() {
        return interviewRepository.findByStatusWithCompany(InterviewStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<Interview> getCompanyInterviews(Long companyId) {
        return interviewRepository.findByCompanyIdWithCompany(companyId);
    }

    @Transactional
    public Interview createInterview(Interview interview) {
        User currentUser = userService.getCurrentUser();
        interview.setCreatedBy(currentUser);
        interview.setCompany(currentUser.getCompany());
        interview.setStatus(InterviewStatus.DRAFT);
        interview.setIsPublic(false);

        return interviewRepository.save(interview);
    }

    @Transactional
    public Interview updateInterview(Long id, Interview updateData) {
        Interview interview = getInterviewById(id);

        if (updateData.getTitle() != null) {
            interview.setTitle(updateData.getTitle());
        }
        if (updateData.getDescription() != null) {
            interview.setDescription(updateData.getDescription());
        }
        if (updateData.getLevel() != null) {
            interview.setLevel(updateData.getLevel());
        }
        if (updateData.getType() != null) {
            interview.setType(updateData.getType());
        }
        if (updateData.getDurationMinutes() != null) {
            interview.setDurationMinutes(updateData.getDurationMinutes());
        }
        if (updateData.getPassingScore() != null) {
            interview.setPassingScore(updateData.getPassingScore());
        }

        return interviewRepository.save(interview);
    }

    @Transactional
    public Interview publishInterview(Long id) {
        Interview interview = getInterviewById(id);
        interview.setStatus(InterviewStatus.ACTIVE);
        interview.setIsPublic(true);
        return interviewRepository.save(interview);
    }

    @Transactional
    public Interview archiveInterview(Long id) {
        Interview interview = getInterviewById(id);
        interview.setStatus(InterviewStatus.ARCHIVED);
        return interviewRepository.save(interview);
    }

    @Transactional
    public void deleteInterview(Long id) {
        Interview interview = getInterviewById(id);
        interviewRepository.delete(interview);
    }

    @Transactional
    public Interview addQuestionToInterview(Long interviewId, Long questionId) {
        Interview interview = getInterviewById(interviewId);
        Question question = questionRepository.findByIdWithCreatedBy(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        
        // Avoid duplicates
        if (!interview.getQuestions().contains(question)) {
            interview.getQuestions().add(question);
            log.info("Added question {} to interview {}", questionId, interviewId);
        }
        
        return interviewRepository.save(interview);
    }

    @Transactional
    public Interview removeQuestionFromInterview(Long interviewId, Long questionId) {
        Interview interview = getInterviewById(interviewId);
        interview.getQuestions().removeIf(q -> q.getId().equals(questionId));
        log.info("Removed question {} from interview {}", questionId, interviewId);
        return interviewRepository.save(interview);
    }
}