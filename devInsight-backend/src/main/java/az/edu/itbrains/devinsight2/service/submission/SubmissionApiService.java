package az.edu.itbrains.devinsight2.service.submission;

import az.edu.itbrains.devinsight2.dto.submission.SubmissionDto;
import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import az.edu.itbrains.devinsight2.repository.submission.SubmissionRepository;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.question.QuestionRepository;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubmissionApiService {
    
    private final SubmissionRepository submissionRepository;
    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public SubmissionDto save(SubmissionDto submissionDto, String tenantId) {
        log.info("Creating submission for tenant: {}, interviewId: {}", tenantId, submissionDto.getInterviewId());
        

        if (submissionDto.getTenantId() != null && !submissionDto.getTenantId().equals(tenantId)) {
            throw new IllegalArgumentException("Tenant ID mismatch between header and body");
        }
        submissionDto.setTenantId(tenantId);
        
        // Validate relationships exist
        var interview = interviewRepository.findById(submissionDto.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        var question = questionRepository.findById(submissionDto.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        var candidate = userRepository.findById(submissionDto.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        // Convert DTO to Entity
        var submission = Submission.builder()
                .interview(interview)
                .question(question)
                .candidate(candidate)
                .answerText(submissionDto.getAnswerText())
                .tenantId(tenantId)
                .codeSubmission(submissionDto.getCodeSubmission())
                .textAnswer(submissionDto.getTextAnswer())
                .videoUrl(submissionDto.getVideoUrl())
                .status(SubmissionStatus.SUBMITTED)
                .startedAt(submissionDto.getStartedAt() != null ? submissionDto.getStartedAt() : LocalDateTime.now())
                .submittedAt(submissionDto.getSubmittedAt())
                .timeSpentSeconds(submissionDto.getTimeSpentSeconds())
                .build();

        var saved = submissionRepository.save(submission);
        log.info("Submission created with ID: {}", saved.getId());
        
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> getByInterviewAndTenant(Long interviewId, String tenantId) {
        log.info("Retrieving submissions for interviewId: {}, tenant: {}", interviewId, tenantId);
        
        var submissions = submissionRepository.findByInterviewIdAndTenantId(interviewId, tenantId);
        return submissions.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Page<SubmissionDto> getPageByInterviewAndTenant(Long interviewId, String tenantId, Pageable pageable) {
        log.info("Retrieving paginated submissions for interviewId: {}, tenant: {}, page: {}", 
                interviewId, tenantId, pageable.getPageNumber());
        
        var page = submissionRepository.findByInterviewIdAndTenantId(interviewId, tenantId, pageable);
        return page.map(this::toDto);
    }

    public void deleteByIdScoped(Long id, String tenantId) {
        log.info("Deleting submission ID: {} for tenant: {}", id, tenantId);
        
        var submission = submissionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found or access denied"));
        
        submissionRepository.delete(submission);
        log.info("Submission deleted successfully");
    }

    private SubmissionDto toDto(Submission submission) {
        return SubmissionDto.builder()
                .id(submission.getId())
                .candidateId(submission.getCandidate().getId())
                .interviewId(submission.getInterview().getId())
                .questionId(submission.getQuestion().getId())
                .answerText(submission.getAnswerText())
                .tenantId(submission.getTenantId())
                .codeSubmission(submission.getCodeSubmission())
                .textAnswer(submission.getTextAnswer())
                .videoUrl(submission.getVideoUrl())
                .status(submission.getStatus().name())
                .startedAt(submission.getStartedAt())
                .submittedAt(submission.getSubmittedAt())
                .timeSpentSeconds(submission.getTimeSpentSeconds())
                .createdAt(submission.getCreatedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }
}