package az.edu.itbrains.devinsight2.cv.controller;

import az.edu.itbrains.devinsight2.cv.dto.CVTextDto;
import az.edu.itbrains.devinsight2.cv.dto.CVUploadResponseDto;
import az.edu.itbrains.devinsight2.cv.entity.CandidateCV;
import az.edu.itbrains.devinsight2.cv.repository.CandidateCVRepository;
import az.edu.itbrains.devinsight2.cv.service.CVTextExtractionService;
import az.edu.itbrains.devinsight2.cv.service.FileStorageService;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/cv")
@RequiredArgsConstructor
@Slf4j
public class CVController {

    private final FileStorageService fileStorageService;
    private final CVTextExtractionService textExtractionService;
    private final CandidateCVRepository candidateCVRepository;
    private final UserRepository userRepository;

    @Value("${app.file-storage.cv-upload-dir:${user.home}/devinsight/cvs}")
    private String cvUploadDir;

    private static final int TEXT_PREVIEW_LENGTH = 200;

    /**
     * Upload CV file
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    @Transactional
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

            CVUploadResponseDto dto = CVUploadResponseDto.builder()
                    .success(true)
                    .message(extractionResult.isSuccess() 
                        ? "CV uploaded and text extracted successfully"
                        : "CV uploaded but text extraction failed: " + extractionResult.getErrorMessage())
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .fileType(fileType)
                    .uploadedDate(candidateCV.getUploadedDate())
                    .textExtracted(extractionResult.isSuccess())
                    .cvTextPreview(textPreview)
                    .textQuality(extractionResult.getQuality())
                    .extractionError(extractionResult.isSuccess() ? null : extractionResult.getErrorMessage())
                    .build();

            response.put("success", true);
            response.put("message", dto.getMessage());
            response.put("data", dto);

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
     * Get CV info
     */
    @GetMapping("/info")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getCVInfo(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = getUserIdFromAuth(authentication);
            Optional<CandidateCV> cvOptional = candidateCVRepository.findByUserId(userId);

            if (cvOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "No CV found");
                return ResponseEntity.ok(response);
            }

            CandidateCV cv = cvOptional.get();
            
            // Prepare text preview
            String textPreview = cv.getTextExtracted() && cv.getCvText() != null
                ? textExtractionService.getTextPreview(cv.getCvText(), TEXT_PREVIEW_LENGTH)
                : null;
            
            Map<String, Object> cvData = new HashMap<>();
            cvData.put("fileName", cv.getFileName());
            cvData.put("fileSize", cv.getFileSize());
            cvData.put("fileType", cv.getFileType());
            cvData.put("uploadedDate", cv.getUploadedDate());
            cvData.put("textExtracted", cv.getTextExtracted());
            cvData.put("cvTextPreview", textPreview);
            cvData.put("textQuality", cv.getTextQuality());
            cvData.put("extractionError", cv.getExtractionError());

            response.put("success", true);
            response.put("data", cvData);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get CV info", e);
            response.put("success", false);
            response.put("message", "Failed to get CV info");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get full extracted CV text
     */
    @GetMapping("/text")
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    public ResponseEntity<CVTextDto> getExtractedText(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuth(authentication);
            Optional<CandidateCV> cvOptional = candidateCVRepository.findByUserId(userId);

            if (cvOptional.isEmpty()) {
                log.warn("No CV found for user {}", userId);
                return ResponseEntity.notFound().build();
            }

            CandidateCV cv = cvOptional.get();

            // Check if text is extracted
            if (cv.getCvText() == null || cv.getCvText().isEmpty()) {
                log.info("CV text not yet extracted for user {}", userId);
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(CVTextDto.builder()
                        .text("Text extraction pending...")
                        .quality("UNKNOWN")
                        .wordCount(0)
                        .build());
            }

            // Calculate word count
            int wordCount = cv.getCvText().split("\\s+").length;
            
            // Get quality as string
            String quality = cv.getTextQuality() != null 
                ? cv.getTextQuality().name() 
                : "MEDIUM";

            log.debug("Returning CV text for user {}, {} words, quality: {}", 
                userId, wordCount, quality);

            return ResponseEntity.ok(CVTextDto.builder()
                .text(cv.getCvText())
                .quality(quality)
                .wordCount(wordCount)
                .build());

        } catch (Exception e) {
            log.error("Failed to get CV text", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete CV
     */
    @DeleteMapping
    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN', 'HR')")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteCV(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long userId = getUserIdFromAuth(authentication);
            Optional<CandidateCV> cvOptional = candidateCVRepository.findByUserId(userId);

            if (cvOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "No CV found");
                return ResponseEntity.ok(response);
            }

            CandidateCV cv = cvOptional.get();
            
            try {
                fileStorageService.deleteCV(cv.getFilePath());
            } catch (Exception e) {
                log.warn("Failed to delete file: {}", e.getMessage());
            }

            candidateCVRepository.delete(cv);

            response.put("success", true);
            response.put("message", "CV deleted successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Delete failed", e);
            response.put("success", false);
            response.put("message", "Failed to delete CV");
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
}
