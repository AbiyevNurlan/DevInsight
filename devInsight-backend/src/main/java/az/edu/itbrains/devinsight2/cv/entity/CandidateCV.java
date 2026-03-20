package az.edu.itbrains.devinsight2.cv.entity;

import az.edu.itbrains.devinsight2.cv.enums.TextQuality;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_cvs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateCV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false, unique = true)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_type", nullable = false, length = 10)
    private String fileType;

    @Column(name = "uploaded_date", nullable = false)
    private LocalDateTime uploadedDate;

    // Text extraction fields
    @Column(name = "cv_text", columnDefinition = "TEXT")
    private String cvText;

    @Column(name = "text_extracted", nullable = false)
    @Builder.Default
    private Boolean textExtracted = false;

    @Column(name = "text_extracted_at")
    private LocalDateTime textExtractedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "text_quality", length = 10)
    private TextQuality textQuality;

    @Column(name = "extraction_error")
    private String extractionError;

    // AI Analysis fields
    @Column(name = "is_analyzed", nullable = false)
    @Builder.Default
    private Boolean isAnalyzed = false;

    @Column(name = "analysis_date")
    private LocalDateTime analysisDate;

    @Column(name = "analysis_skills", columnDefinition = "TEXT")
    private String analysisSkills; // JSON array as string

    @Column(name = "experience_level", length = 50)
    private String experienceLevel; // JUNIOR, MID, SENIOR

    @Column(name = "job_categories", columnDefinition = "TEXT")
    private String jobCategories; // JSON array as string

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "education")
    private String education;

    @Column(name = "languages", columnDefinition = "TEXT")
    private String languages; // JSON array as string

    @Column(name = "analysis_summary", columnDefinition = "TEXT")
    private String analysisSummary;

    @PrePersist
    protected void onCreate() {
        if (uploadedDate == null) {
            uploadedDate = LocalDateTime.now();
        }
        if (textExtracted == null) {
            textExtracted = false;
        }
        if (isAnalyzed == null) {
            isAnalyzed = false;
        }
    }
}
