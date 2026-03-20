package az.edu.itbrains.devinsight2.cv.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${app.file-storage.cv-upload-dir:${user.home}/devinsight/cvs}")
    private String cvUploadDir;

    @Value("${app.file-storage.max-file-size:5242880}")
    private long maxFileSize;

    // PDF and DOCX content types
    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Store CV file for a user
     */
    public String storeCV(MultipartFile file, Long userId) throws IOException {
        if (!isValidCVFile(file)) {
            throw new IllegalArgumentException("Invalid CV file. Only PDF and DOCX files under 5MB are allowed.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new IllegalArgumentException("Invalid filename");
        }

        // Create user directory
        Path userDir = Paths.get(cvUploadDir, userId.toString());
        if (!Files.exists(userDir)) {
            Files.createDirectories(userDir);
        }

        // Generate unique filename
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        String fileExtension = getFileExtension(originalFilename);
        String newFilename = String.format("cv_%s%s", timestamp, fileExtension);

        // Store file
        Path targetPath = userDir.resolve(newFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return String.format("%s/%s", userId, newFilename);
    }

    /**
     * Load CV file content
     */
    public byte[] loadCV(String filePath) throws IOException {
        Path path = Paths.get(cvUploadDir, filePath);
        if (!Files.exists(path)) {
            throw new IOException("File not found: " + filePath);
        }
        return Files.readAllBytes(path);
    }

    /**
     * Delete CV file
     */
    public void deleteCV(String filePath) throws IOException {
        Path path = Paths.get(cvUploadDir, filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }

    /**
     * Validate CV file
     */
    public boolean isValidCVFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        if (file.getSize() > maxFileSize) {
            return false;
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return false;
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            return false;
        }

        String extension = getFileExtension(filename).toLowerCase();
        if (contentType.contains("pdf") && !extension.equals(".pdf")) {
            return false;
        }
        if (contentType.contains("wordprocessingml") && !extension.equals(".docx")) {
            return false;
        }

        return true;
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex);
    }

    /**
     * Get file type label
     */
    public String getFileTypeLabel(String contentType) {
        if (contentType == null) {
            return "UNKNOWN";
        }
        if (contentType.contains("pdf")) {
            return "PDF";
        }
        if (contentType.contains("wordprocessingml")) {
            return "DOCX";
        }
        return "UNKNOWN";
    }
}
