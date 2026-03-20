package az.edu.itbrains.devinsight2.service.admin;

import az.edu.itbrains.devinsight2.dto.admin.ParticipantDto;
import az.edu.itbrains.devinsight2.dto.auth.UserManageDto;
import az.edu.itbrains.devinsight2.dto.company.CompanyManageDto;
import az.edu.itbrains.devinsight2.dto.interview.InterviewManageDto;
import az.edu.itbrains.devinsight2.dto.submission.SubmissionManageDto;
import az.edu.itbrains.devinsight2.exception.BadRequestException;
import az.edu.itbrains.devinsight2.exception.ResourceNotFoundException;
import az.edu.itbrains.devinsight2.model.company.Company;
import az.edu.itbrains.devinsight2.model.core.AccountStatus;
import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.interview.InterviewStatus;
import az.edu.itbrains.devinsight2.model.submission.Submission;
import az.edu.itbrains.devinsight2.model.submission.SubmissionStatus;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.repository.company.CompanyRepository;
import az.edu.itbrains.devinsight2.repository.interview.InterviewRepository;
import az.edu.itbrains.devinsight2.repository.submission.SubmissionRepository;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import az.edu.itbrains.devinsight2.service.audit.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminManagementService {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final CompanyRepository companyRepository;
    private final SubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    // ==================== USER MANAGEMENT ====================

    @Transactional(readOnly = true)
    public Page<UserManageDto> getAllUsers(Pageable pageable, String search) {
        Page<User> users = userRepository.findAll(pageable);
        List<UserManageDto> userDtos = users.getContent().stream()
                .filter(u -> search == null || search.isEmpty() || 
                        u.getEmail().toLowerCase().contains(search.toLowerCase()) ||
                        u.getFullName().toLowerCase().contains(search.toLowerCase()))
                .map(this::mapToUserManageDto)
                .collect(Collectors.toList());
        return new PageImpl<>(userDtos, pageable, users.getTotalElements());
    }

    @Transactional(readOnly = true)
    public UserManageDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserManageDto(user);
    }

    @Transactional
    public UserManageDto createUser(UserManageDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "default123"))
                .fullName(dto.getFullName())
                .role(dto.getRole() != null ? dto.getRole() : UserRole.CANDIDATE)
                .status(dto.getStatus() != null ? dto.getStatus() : AccountStatus.ACTIVE)
                .phone(dto.getPhone())
                .linkedinUrl(dto.getLinkedinUrl())
                .githubUrl(dto.getGithubUrl())
                .bio(dto.getBio())
                .skills(dto.getSkills() != null ? dto.getSkills() : new HashSet<>())
                .avatarUrl(dto.getAvatarUrl())
                .build();

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            user.setCompany(company);
        }

        User saved = userRepository.save(user);
        auditLogService.logCreate("USER", saved.getId(), mapToUserManageDto(saved));
        log.info("Created user: {}", saved.getEmail());
        return mapToUserManageDto(saved);
    }

    @Transactional
    public UserManageDto updateUser(Long id, UserManageDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        UserManageDto oldDto = mapToUserManageDto(user);

        // Check email uniqueness if changed
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus());
        user.setPhone(dto.getPhone());
        user.setLinkedinUrl(dto.getLinkedinUrl());
        user.setGithubUrl(dto.getGithubUrl());
        user.setBio(dto.getBio());
        if (dto.getSkills() != null) user.setSkills(dto.getSkills());
        user.setAvatarUrl(dto.getAvatarUrl());

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            user.setCompany(company);
        } else {
            user.setCompany(null);
        }

        User saved = userRepository.save(user);
        auditLogService.logUpdate("USER", saved.getId(), oldDto, mapToUserManageDto(saved));
        log.info("Updated user: {}", saved.getEmail());
        return mapToUserManageDto(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        auditLogService.logDelete("USER", id, mapToUserManageDto(user));
        userRepository.delete(user);
        log.info("Deleted user: {}", user.getEmail());
    }

    private UserManageDto mapToUserManageDto(User user) {
        Set<String> skills = new HashSet<>();
        try {
            if (user.getSkills() != null) {
                skills = new HashSet<>(user.getSkills());
            }
        } catch (Exception e) {
            // Lazy loading failed, use empty set
        }
        
        return UserManageDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .phone(user.getPhone())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .bio(user.getBio())
                .skills(skills)
                .avatarUrl(user.getAvatarUrl())
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .build();
    }

    // ==================== INTERVIEW MANAGEMENT ====================

    @Transactional(readOnly = true)
    public Page<InterviewManageDto> getAllInterviews(Pageable pageable, String search) {
        Page<Interview> interviews = interviewRepository.findAll(pageable);
        List<InterviewManageDto> dtos = interviews.getContent().stream()
                .filter(i -> search == null || search.isEmpty() ||
                        i.getTitle().toLowerCase().contains(search.toLowerCase()))
                .map(this::mapToInterviewManageDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, interviews.getTotalElements());
    }

    @Transactional(readOnly = true)
    public InterviewManageDto getInterviewById(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        return mapToInterviewManageDto(interview);
    }

    @Transactional
    public InterviewManageDto createInterview(InterviewManageDto dto) {
        Interview interview = Interview.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .level(dto.getLevel())
                .type(dto.getType())
                .durationMinutes(dto.getDurationMinutes())
                .status(dto.getStatus() != null ? dto.getStatus() : InterviewStatus.DRAFT)
                .isPublic(dto.getIsPublic() != null ? dto.getIsPublic() : false)
                .passingScore(dto.getPassingScore())
                .build();

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            interview.setCompany(company);
        } else {
            // Auto-assign to first company if not specified (for Admin created interviews)
            companyRepository.findAll().stream().findFirst().ifPresent(interview::setCompany);
            log.info("Auto-assigned interview to company: {}", 
                    interview.getCompany() != null ? interview.getCompany().getName() : "none");
        }

        if (dto.getCreatedById() != null) {
            User creator = userRepository.findById(dto.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            interview.setCreatedBy(creator);
        }

        Interview saved = interviewRepository.save(interview);
        auditLogService.logCreate("INTERVIEW", saved.getId(), mapToInterviewManageDto(saved));
        log.info("Created interview: {}", saved.getTitle());
        return mapToInterviewManageDto(saved);
    }

    @Transactional
    public InterviewManageDto updateInterview(Long id, InterviewManageDto dto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));

        InterviewManageDto oldDto = mapToInterviewManageDto(interview);

        interview.setTitle(dto.getTitle());
        interview.setDescription(dto.getDescription());
        interview.setLevel(dto.getLevel());
        interview.setType(dto.getType());
        interview.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getStatus() != null) interview.setStatus(dto.getStatus());
        if (dto.getIsPublic() != null) interview.setIsPublic(dto.getIsPublic());
        interview.setPassingScore(dto.getPassingScore());

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
            interview.setCompany(company);
        } else {
            interview.setCompany(null);
        }

        Interview saved = interviewRepository.save(interview);
        auditLogService.logUpdate("INTERVIEW", saved.getId(), oldDto, mapToInterviewManageDto(saved));
        log.info("Updated interview: {}", saved.getTitle());
        return mapToInterviewManageDto(saved);
    }

    @Transactional
    public void deleteInterview(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        auditLogService.logDelete("INTERVIEW", id, mapToInterviewManageDto(interview));
        interviewRepository.delete(interview);
        log.info("Deleted interview: {}", interview.getTitle());
    }

    private InterviewManageDto mapToInterviewManageDto(Interview interview) {
        return InterviewManageDto.builder()
                .id(interview.getId())
                .title(interview.getTitle())
                .description(interview.getDescription())
                .level(interview.getLevel())
                .type(interview.getType())
                .durationMinutes(interview.getDurationMinutes())
                .companyId(interview.getCompany() != null ? interview.getCompany().getId() : null)
                .companyName(interview.getCompany() != null ? interview.getCompany().getName() : null)
                .createdById(interview.getCreatedBy() != null ? interview.getCreatedBy().getId() : null)
                .createdByName(interview.getCreatedBy() != null ? interview.getCreatedBy().getFullName() : null)
                .status(interview.getStatus())
                .isPublic(interview.getIsPublic())
                .passingScore(interview.getPassingScore())
                .createdAt(interview.getCreatedAt())
                .updatedAt(interview.getUpdatedAt())
                .build();
    }

    // ==================== COMPANY MANAGEMENT ====================

    @Transactional(readOnly = true)
    public Page<CompanyManageDto> getAllCompanies(Pageable pageable, String search) {
        Page<Company> companies = companyRepository.findAll(pageable);
        List<CompanyManageDto> dtos = companies.getContent().stream()
                .filter(c -> search == null || search.isEmpty() ||
                        c.getName().toLowerCase().contains(search.toLowerCase()))
                .map(this::mapToCompanyManageDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, companies.getTotalElements());
    }

    @Transactional(readOnly = true)
    public CompanyManageDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return mapToCompanyManageDto(company);
    }

    @Transactional
    public CompanyManageDto createCompany(CompanyManageDto dto) {
        if (dto.getDomain() != null && companyRepository.existsByDomain(dto.getDomain())) {
            throw new BadRequestException("Domain already exists: " + dto.getDomain());
        }

        Company company = Company.builder()
                .name(dto.getName())
                .domain(dto.getDomain())
                .description(dto.getDescription())
                .industry(dto.getIndustry())
                .website(dto.getWebsite())
                .logoUrl(dto.getLogoUrl())
                .size(dto.getSize())
                .build();

        Company saved = companyRepository.save(company);
        auditLogService.logCreate("COMPANY", saved.getId(), mapToCompanyManageDto(saved));
        log.info("Created company: {}", saved.getName());
        return mapToCompanyManageDto(saved);
    }

    @Transactional
    public CompanyManageDto updateCompany(Long id, CompanyManageDto dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        CompanyManageDto oldDto = mapToCompanyManageDto(company);

        // Check domain uniqueness if changed
        if (dto.getDomain() != null && !dto.getDomain().equals(company.getDomain()) 
                && companyRepository.existsByDomain(dto.getDomain())) {
            throw new BadRequestException("Domain already exists: " + dto.getDomain());
        }

        company.setName(dto.getName());
        company.setDomain(dto.getDomain());
        company.setDescription(dto.getDescription());
        company.setIndustry(dto.getIndustry());
        company.setWebsite(dto.getWebsite());
        company.setLogoUrl(dto.getLogoUrl());
        if (dto.getSize() != null) company.setSize(dto.getSize());

        Company saved = companyRepository.save(company);
        auditLogService.logUpdate("COMPANY", saved.getId(), oldDto, mapToCompanyManageDto(saved));
        log.info("Updated company: {}", saved.getName());
        return mapToCompanyManageDto(saved);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        auditLogService.logDelete("COMPANY", id, mapToCompanyManageDto(company));
        companyRepository.delete(company);
        log.info("Deleted company: {}", company.getName());
    }

    private CompanyManageDto mapToCompanyManageDto(Company company) {
        return CompanyManageDto.builder()
                .id(company.getId())
                .name(company.getName())
                .domain(company.getDomain())
                .description(company.getDescription())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .logoUrl(company.getLogoUrl())
                .size(company.getSize())
                .employeeCount(company.getEmployees() != null ? company.getEmployees().size() : 0)
                .interviewCount(company.getInterviews() != null ? company.getInterviews().size() : 0)
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }

    // ==================== SUBMISSION MANAGEMENT ====================

    @Transactional(readOnly = true)
    public Page<SubmissionManageDto> getAllSubmissions(Pageable pageable, String search) {
        Page<Submission> submissions = submissionRepository.findAll(pageable);
        List<SubmissionManageDto> dtos = submissions.getContent().stream()
                .map(this::mapToSubmissionManageDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, submissions.getTotalElements());
    }

    @Transactional(readOnly = true)
    public SubmissionManageDto getSubmissionById(Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));
        return mapToSubmissionManageDto(submission);
    }

    @Transactional
    public SubmissionManageDto updateSubmissionStatus(Long id, SubmissionStatus status) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));

        SubmissionManageDto oldDto = mapToSubmissionManageDto(submission);
        submission.setStatus(status);
        Submission saved = submissionRepository.save(submission);
        auditLogService.logUpdate("SUBMISSION", saved.getId(), oldDto, mapToSubmissionManageDto(saved));
        log.info("Updated submission status: {} -> {}", id, status);
        return mapToSubmissionManageDto(saved);
    }

    @Transactional
    public void deleteSubmission(Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));
        auditLogService.logDelete("SUBMISSION", id, mapToSubmissionManageDto(submission));
        submissionRepository.delete(submission);
        log.info("Deleted submission: {}", id);
    }

    private SubmissionManageDto mapToSubmissionManageDto(Submission submission) {
        return SubmissionManageDto.builder()
                .id(submission.getId())
                .interviewId(submission.getInterview() != null ? submission.getInterview().getId() : null)
                .interviewTitle(submission.getInterview() != null ? submission.getInterview().getTitle() : null)
                .candidateId(submission.getCandidate() != null ? submission.getCandidate().getId() : null)
                .candidateName(submission.getCandidate() != null ? submission.getCandidate().getFullName() : null)
                .candidateEmail(submission.getCandidate() != null ? submission.getCandidate().getEmail() : null)
                .questionId(submission.getQuestion() != null ? submission.getQuestion().getId() : null)
                .questionTitle(submission.getQuestion() != null ? submission.getQuestion().getTitle() : null)
                .codeSubmission(submission.getCodeSubmission())
                .textAnswer(submission.getTextAnswer())
                .videoUrl(submission.getVideoUrl())
                .status(submission.getStatus())
                .startedAt(submission.getStartedAt())
                .submittedAt(submission.getSubmittedAt())
                .timeSpentSeconds(submission.getTimeSpentSeconds())
                .createdAt(submission.getCreatedAt())
                .overallScore(submission.getAnalysis() != null ? submission.getAnalysis().getOverallScore() : null)
                .feedback(submission.getAnalysis() != null ? submission.getAnalysis().getAiGeneratedFeedback() : null)
                .build();
    }

    // ==================== STATISTICS ====================

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalInterviews", interviewRepository.count());
        stats.put("totalCompanies", companyRepository.count());
        stats.put("totalSubmissions", submissionRepository.count());
        stats.put("activeInterviews", interviewRepository.countByStatus(InterviewStatus.ACTIVE));
        stats.put("draftInterviews", interviewRepository.countByStatus(InterviewStatus.DRAFT));
        return stats;
    }

    // ==================== PARTICIPANT MANAGEMENT ====================

    @Transactional(readOnly = true)
    public Page<ParticipantDto> getAllParticipants(Pageable pageable, String search, 
            LocalDate startDate, LocalDate endDate, String status, String role) {
        
        // Use query with eager loading to avoid lazy loading issues
        List<Submission> allSubmissions = submissionRepository.findAllWithRelations();
        
        List<ParticipantDto> participants = allSubmissions.stream()
                .filter(s -> filterSubmission(s, search, startDate, endDate, status, role))
                .map(this::mapToParticipantDto)
                .collect(Collectors.toList());
        
        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), participants.size());
        
        List<ParticipantDto> pageContent = start < participants.size() 
            ? participants.subList(start, end) 
            : List.of();
        
        return new PageImpl<>(pageContent, pageable, participants.size());
    }

    private boolean filterSubmission(Submission s, String search, LocalDate startDate, 
            LocalDate endDate, String status, String role) {
        
        // Search filter
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            boolean matchesSearch = false;
            if (s.getCandidate() != null) {
                matchesSearch = (s.getCandidate().getFullName() != null && 
                        s.getCandidate().getFullName().toLowerCase().contains(searchLower)) ||
                        (s.getCandidate().getEmail() != null && 
                        s.getCandidate().getEmail().toLowerCase().contains(searchLower));
            }
            if (!matchesSearch && s.getInterview() != null && s.getInterview().getTitle() != null) {
                matchesSearch = s.getInterview().getTitle().toLowerCase().contains(searchLower);
            }
            if (!matchesSearch) return false;
        }
        
        // Date filters
        if (startDate != null && s.getStartedAt() != null) {
            if (s.getStartedAt().toLocalDate().isBefore(startDate)) return false;
        }
        if (endDate != null && s.getStartedAt() != null) {
            if (s.getStartedAt().toLocalDate().isAfter(endDate)) return false;
        }
        
        // Status filter
        if (status != null && !status.isEmpty() && s.getStatus() != null) {
            if (!s.getStatus().name().equalsIgnoreCase(status)) return false;
        }
        
        // Role filter
        if (role != null && !role.isEmpty() && s.getCandidate() != null && s.getCandidate().getRole() != null) {
            if (!s.getCandidate().getRole().name().equalsIgnoreCase(role)) return false;
        }
        
        return true;
    }

    @Transactional(readOnly = true)
    public ParticipantDto getParticipantById(Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant submission not found with id: " + id));
        return mapToParticipantDto(submission);
    }

    @Transactional(readOnly = true)
    public List<ParticipantDto> getParticipantsByInterview(Long interviewId) {
        List<Submission> submissions = submissionRepository.findByInterviewIdWithRelations(interviewId);
        return submissions.stream()
                .map(this::mapToParticipantDto)
                .collect(Collectors.toList());
    }

    private ParticipantDto mapToParticipantDto(Submission submission) {
        Integer score = null;
        Integer maxScore = 100;
        Double percentage = null;
        String feedback = null;
        Boolean passed = null;
        
        if (submission.getAnalysis() != null) {
            score = submission.getAnalysis().getOverallScore();
            feedback = submission.getAnalysis().getAiGeneratedFeedback();
            if (score != null) {
                percentage = (score * 100.0) / maxScore;
                passed = percentage >= 70.0; // Default passing threshold
            }
        }
        
        Integer durationMinutes = null;
        if (submission.getStartedAt() != null && submission.getSubmittedAt() != null) {
            durationMinutes = (int) ChronoUnit.MINUTES.between(
                submission.getStartedAt(), submission.getSubmittedAt());
        }
        
        return ParticipantDto.builder()
                .id(submission.getId())
                .candidateId(submission.getCandidate() != null ? submission.getCandidate().getId() : null)
                .candidateName(submission.getCandidate() != null ? submission.getCandidate().getFullName() : null)
                .candidateEmail(submission.getCandidate() != null ? submission.getCandidate().getEmail() : null)
                .role(submission.getCandidate() != null && submission.getCandidate().getRole() != null ? 
                    submission.getCandidate().getRole().name() : null)
                .interviewId(submission.getInterview() != null ? submission.getInterview().getId() : null)
                .interviewTitle(submission.getInterview() != null ? submission.getInterview().getTitle() : null)
                .examStartTime(submission.getStartedAt())
                .examEndTime(submission.getSubmittedAt())
                .durationMinutes(durationMinutes)
                .timeSpentSeconds(submission.getTimeSpentSeconds())
                .status(submission.getStatus())
                .score(score)
                .maxScore(maxScore)
                .percentage(percentage)
                .feedback(feedback)
                .passed(passed)
                .createdAt(submission.getCreatedAt())
                .companyName(submission.getInterview() != null && submission.getInterview().getCompany() != null ?
                    submission.getInterview().getCompany().getName() : null)
                .build();
    }
}
