package az.edu.itbrains.devinsight2.controller.candidate;

import az.edu.itbrains.devinsight2.dto.candidate.CandidateInterviewHistoryDto;
import az.edu.itbrains.devinsight2.dto.candidate.CandidateProfileDto;
import az.edu.itbrains.devinsight2.dto.candidate.UpdateCandidateStatusDto;
import az.edu.itbrains.devinsight2.dto.common.ApiResponse;
import az.edu.itbrains.devinsight2.dto.common.PageResponse;
import az.edu.itbrains.devinsight2.service.candidate.CandidateService;
import az.edu.itbrains.devinsight2.cv.service.FileStorageService;
import az.edu.itbrains.devinsight2.cv.service.CVTextExtractionService;
import az.edu.itbrains.devinsight2.cv.service.CVAIAnalysisService;
import az.edu.itbrains.devinsight2.cv.dto.CVAnalysisResultDto;
import az.edu.itbrains.devinsight2.cv.entity.CandidateCV;
import az.edu.itbrains.devinsight2.cv.repository.CandidateCVRepository;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Qualifier;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.Optional;

/**
 * REST controller for candidate management
 */
@RestController
@RequestMapping("/candidates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Candidate Management", description = "Endpoints for managing candidates and viewing their profiles")
public class CandidateController {

    private final CandidateService candidateService;
    private final FileStorageService fileStorageService;
    private final CVTextExtractionService textExtractionService;
    private final CandidateCVRepository candidateCVRepository;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    
    @org.springframework.beans.factory.annotation.Autowired
    @Qualifier("cvAIAnalysisService")
    private CVAIAnalysisService aiAnalysisService;
    
    @org.springframework.beans.factory.annotation.Value("${app.file-storage.cv-upload-dir:${user.home}/devinsight/cvs}")
    private String cvUploadDir;
    
    private static final int TEXT_PREVIEW_LENGTH = 200;

    /**
     * Get all candidates with optional filters
     * GET /api/candidates
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Get all candidates",
        description = "Get paginated list of candidates with optional filters for status, date range, and skills"
    )
    public ResponseEntity<ApiResponse<PageResponse<CandidateProfileDto>>> getAllCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String skills
    ) {
        log.info("GET /api/candidates - page: {}, size: {}, status: {}, search: {}", 
                page, size, status, search);

        Sort sort = sortDir.equalsIgnoreCase("asc") ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CandidateProfileDto> candidates = candidateService.getAllCandidates(
                pageable, search, status, startDate, endDate, skills);

        return ResponseEntity.ok(
            ApiResponse.success("Candidates retrieved successfully", PageResponse.of(candidates))
        );
    }

    /**
     * Get candidate profile by ID
     * GET /api/candidates/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @currentUserService.isCurrentUser(#id)")
    @Operation(
        summary = "Get candidate profile",
        description = "Get detailed candidate profile with statistics and interview history"
    )
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getCandidateById(
            @PathVariable Long id
    ) {
        log.info("GET /api/candidates/{}", id);

        CandidateProfileDto candidate = candidateService.getCandidateById(id);

        return ResponseEntity.ok(
            ApiResponse.success("Candidate profile retrieved successfully", candidate)
        );
    }

    /**
     * Get interview history for candidate
     * GET /api/candidates/{id}/history
     */
    @GetMapping("/{id}/history")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @currentUserService.isCurrentUser(#id)")
    @Operation(
        summary = "Get candidate interview history",
        description = "Get list of all interviews attempted by the candidate with results and statistics"
    )
    public ResponseEntity<ApiResponse<List<CandidateInterviewHistoryDto>>> getCandidateHistory(
            @PathVariable Long id
    ) {
        log.info("GET /api/candidates/{}/history", id);

        List<CandidateInterviewHistoryDto> history = candidateService.getCandidateHistory(id);

        return ResponseEntity.ok(
            ApiResponse.success("Interview history retrieved successfully", history)
        );
    }

    /**
     * Update candidate status
     * PUT /api/candidates/{id}/status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    @Operation(
        summary = "Update candidate status",
        description = "Update candidate status (SCHEDULED, INTERVIEWED, PASSED, FAILED, NEW)"
    )
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateCandidateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCandidateStatusDto dto
    ) {
        log.info("PUT /api/candidates/{}/status - status: {}", id, dto.getStatus());

        CandidateProfileDto updatedCandidate = candidateService.updateCandidateStatus(
                id, dto.getStatus(), dto.getNotes());

        return ResponseEntity.ok(
            ApiResponse.success("Candidate status updated successfully", updatedCandidate)
        );
    }

    /**
     * Upload CV for candidate
     * POST /api/candidates/cv/upload
     */
    @PostMapping("/cv/upload")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    @Transactional
    @Operation(
        summary = "Upload candidate CV",
        description = "Upload CV file (PDF or DOCX) for the current candidate"
    )
    public ResponseEntity<Map<String, Object>> uploadCV(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = getUserIdFromAuth(authentication);
            log.info("User {} uploading CV: {}", userId, file.getOriginalFilename());

            if (!fileStorageService.isValidCVFile(file)) {
                response.put("success", false);
                response.put("message", "Invalid file. Only PDF and DOCX files under 5MB are allowed.");
                return ResponseEntity.badRequest().body(response);
            }

            // Delete old CV if exists
            Optional<CandidateCV> existingCV = candidateCVRepository.findByUserId(userId);
            if (existingCV.isPresent()) {
                CandidateCV oldCV = existingCV.get();
                try {
                    fileStorageService.deleteCV(oldCV.getFilePath());
                } catch (Exception e) {
                    log.warn("Failed to delete old CV: {}", e.getMessage());
                }
                candidateCVRepository.delete(oldCV);
            }

            // Store new file
            String filePath = fileStorageService.storeCV(file, userId);
            String fileType = fileStorageService.getFileTypeLabel(file.getContentType());

            // Extract text from CV
            Path fullFilePath = Paths.get(cvUploadDir, filePath);
            CVTextExtractionService.ExtractionResult extractionResult = 
                textExtractionService.extractText(fullFilePath);

            CandidateCV candidateCV = CandidateCV.builder()
                    .userId(userId)
                    .fileName(file.getOriginalFilename())
                    .filePath(filePath)
                    .fileSize(file.getSize())
                    .fileType(fileType)
                    .uploadedDate(LocalDateTime.now())
                    .textExtracted(extractionResult.isSuccess())
                    .cvText(extractionResult.isSuccess() ? extractionResult.getText() : null)
                    .textExtractedAt(extractionResult.isSuccess() ? LocalDateTime.now() : null)
                    .textQuality(extractionResult.getQuality())
                    .extractionError(extractionResult.isSuccess() ? null : extractionResult.getErrorMessage())
                    .build();

            candidateCVRepository.save(candidateCV);

            // Prepare text preview
            String textPreview = extractionResult.isSuccess() 
                ? textExtractionService.getTextPreview(extractionResult.getText(), TEXT_PREVIEW_LENGTH)
                : null;

            response.put("success", true);
            response.put("message", extractionResult.isSuccess() 
                ? "CV uploaded and text extracted successfully"
                : "CV uploaded but text extraction failed: " + extractionResult.getErrorMessage());
            response.put("fileName", file.getOriginalFilename());
            response.put("fileSize", file.getSize());
            response.put("fileType", fileType);
            response.put("uploadedDate", LocalDateTime.now());
            response.put("textExtracted", extractionResult.isSuccess());
            response.put("cvTextPreview", textPreview);
            response.put("textQuality", extractionResult.getQuality());

            log.info("CV uploaded for user {}: {}, text extracted: {}", 
                userId, filePath, extractionResult.isSuccess());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            log.error("Upload failed", e);
            response.put("success", false);
            response.put("message", "Failed to upload CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Extract user ID from authentication
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        
        // If principal is User entity
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        
        // If principal is UserDetails (which User implements)
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("User not found: " + email));
        }
        
        // If principal is String (email)
        if (principal instanceof String) {
            String email = (String) principal;
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("User not found: " + email));
        }
        
        // If principal is Long (user ID)
        if (principal instanceof Long) {
            return (Long) principal;
        }
        
        throw new IllegalStateException("Unable to extract user ID from authentication");
    }

    /**
     * Get extracted text from user's CV
     * GET /api/candidates/cv/text
     */
    @GetMapping("/cv/text")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    @Operation(
        summary = "Get extracted CV text",
        description = "Get the full extracted text from the current user's CV"
    )
    public ResponseEntity<Map<String, Object>> getExtractedText(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = getUserIdFromAuth(authentication);
            Optional<CandidateCV> cvOptional = candidateCVRepository.findByUserId(userId);

            if (cvOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "No CV found");
                return ResponseEntity.badRequest().body(response);
            }

            CandidateCV cv = cvOptional.get();

            if (!cv.getTextExtracted() || cv.getCvText() == null) {
                response.put("success", false);
                response.put("message", "Text not extracted from CV");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("success", true);
            response.put("text", cv.getCvText());
            response.put("quality", cv.getTextQuality());
            response.put("wordCount", cv.getCvText().split("\\s+").length);
            response.put("message", "Extracted text retrieved successfully");

            log.info("Retrieved extracted text for user {}", userId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get extracted text", e);
            response.put("success", false);
            response.put("message", "Failed to retrieve extracted text: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Analyze CV using AI
     * POST /api/candidates/cv/analyze
     */
    @PostMapping("/cv/analyze")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    @Transactional
    public ResponseEntity<Map<String, Object>> analyzeCV(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if AI service is available
            if (aiAnalysisService == null) {
                log.error("AI Analysis Service is not initialized");
                response.put("success", false);
                response.put("message", "AI Analysis Service is not available");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            Long userId = getUserIdFromAuth(authentication);
            
            // Get user's CV
            Optional<CandidateCV> cvOptional = candidateCVRepository.findByUserId(userId);
            if (cvOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "No CV found for analysis");
                return ResponseEntity.badRequest().body(response);
            }
            
            CandidateCV cv = cvOptional.get();
            
            // Check if CV text was extracted
            if (!cv.getTextExtracted() || cv.getCvText() == null || cv.getCvText().isEmpty()) {
                response.put("success", false);
                response.put("message", "CV text extraction failed or is empty. Please re-upload your CV.");
                return ResponseEntity.badRequest().body(response);
            }
            
            log.info("Starting CV analysis for user: {}", userId);
            
            // Analyze CV using Claude API
            CVAnalysisResultDto analysisResult = aiAnalysisService.analyzeCV(cv.getCvText());
            
            if (analysisResult == null) {
                log.error("Analysis result is null");
                response.put("success", false);
                response.put("message", "AI analysis failed. Please try again later.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
            // Update CV with analysis results
            cv.setIsAnalyzed(true);
            cv.setAnalysisDate(LocalDateTime.now());
            cv.setAnalysisSkills(objectMapper.writeValueAsString(analysisResult.getSkills()));
            cv.setExperienceLevel(analysisResult.getExperienceLevel());
            cv.setJobCategories(objectMapper.writeValueAsString(analysisResult.getCategories()));
            cv.setYearsOfExperience(analysisResult.getYearsOfExperience());
            cv.setEducation(analysisResult.getEducation());
            cv.setLanguages(objectMapper.writeValueAsString(analysisResult.getLanguages()));
            cv.setAnalysisSummary(analysisResult.getSummary());
            
            candidateCVRepository.save(cv);
            
            log.info("CV analysis completed for user: {}", userId);
            
            response.put("success", true);
            response.put("message", "CV analyzed successfully");
            response.put("data", analysisResult);
            return ResponseEntity.ok(response);
            
        } catch (NullPointerException e) {
            log.error("Null pointer error analyzing CV: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "AI Analysis Service initialization error. Please contact support.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            log.error("Error analyzing CV: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error analyzing CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
