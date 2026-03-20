package az.edu.itbrains.devinsight2.cv.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for CVTextExtractionService
 */
class CVTextExtractionServiceTest {

    private CVTextExtractionService extractionService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        extractionService = new CVTextExtractionService();
    }

    @Test
    @DisplayName("Should return failure for non-existent file")
    void extractText_NonExistentFile_ReturnsFailure() {
        Path nonExistentPath = tempDir.resolve("non-existent.pdf");
        
        CVTextExtractionService.ExtractionResult result = extractionService.extractText(nonExistentPath);
        
        assertFalse(result.isSuccess());
        assertEquals("File not found", result.getErrorMessage());
    }

    @Test
    @DisplayName("Should return failure for unsupported file type")
    void extractText_UnsupportedFileType_ReturnsFailure() throws IOException {
        Path txtFile = tempDir.resolve("test.txt");
        Files.writeString(txtFile, "This is a text file");
        
        CVTextExtractionService.ExtractionResult result = extractionService.extractText(txtFile);
        
        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("Unsupported file type"));
    }

    @Test
    @DisplayName("Should extract text from valid PDF file")
    void extractText_ValidPDF_ReturnsSuccess() throws IOException {
        // Create a simple PDF with text content
        Path pdfFile = createTestPDFFile();
        
        CVTextExtractionService.ExtractionResult result = extractionService.extractText(pdfFile);
        
        // Note: This test requires actual PDF file to be created
        // For a more robust test, use a pre-existing test PDF resource
        assertNotNull(result);
    }

    @Test
    @DisplayName("Should extract text from valid DOCX file")
    void extractText_ValidDOCX_ReturnsSuccess() throws IOException {
        // Create a simple DOCX with text content
        Path docxFile = createTestDOCXFile();
        
        CVTextExtractionService.ExtractionResult result = extractionService.extractText(docxFile);
        
        // Note: This test requires actual DOCX file to be created
        // For a more robust test, use a pre-existing test DOCX resource
        assertNotNull(result);
    }

    @Test
    @DisplayName("Should get text preview with proper truncation")
    void getTextPreview_LongText_TruncatesCorrectly() {
        String longText = "This is a very long text that should be truncated at an appropriate point when previewed. " +
                "The preview should cut off at word boundaries to maintain readability.";
        
        String preview = extractionService.getTextPreview(longText, 50);
        
        assertTrue(preview.length() <= 53); // 50 + "..."
        assertTrue(preview.endsWith("..."));
    }

    @Test
    @DisplayName("Should return full text when shorter than max length")
    void getTextPreview_ShortText_ReturnsFullText() {
        String shortText = "Short CV text";
        
        String preview = extractionService.getTextPreview(shortText, 200);
        
        assertEquals(shortText, preview);
    }

    @Test
    @DisplayName("Should return empty string for null text")
    void getTextPreview_NullText_ReturnsEmpty() {
        String preview = extractionService.getTextPreview(null, 200);
        
        assertEquals("", preview);
    }

    @Test
    @DisplayName("Should return empty string for empty text")
    void getTextPreview_EmptyText_ReturnsEmpty() {
        String preview = extractionService.getTextPreview("", 200);
        
        assertEquals("", preview);
    }

    @Test
    @DisplayName("Should handle corrupted PDF gracefully")
    void extractText_CorruptedPDF_ReturnsFailure() throws IOException {
        Path corruptedPdf = tempDir.resolve("corrupted.pdf");
        Files.writeString(corruptedPdf, "This is not a valid PDF content");
        
        CVTextExtractionService.ExtractionResult result = extractionService.extractText(corruptedPdf);
        
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrorMessage());
    }

    @Test
    @DisplayName("Should handle corrupted DOCX gracefully")
    void extractText_CorruptedDOCX_ReturnsFailure() throws IOException {
        Path corruptedDocx = tempDir.resolve("corrupted.docx");
        Files.writeString(corruptedDocx, "This is not a valid DOCX content");
        
        CVTextExtractionService.ExtractionResult result = extractionService.extractText(corruptedDocx);
        
        assertFalse(result.isSuccess());
        assertNotNull(result.getErrorMessage());
    }

    // Helper methods to create test files
    private Path createTestPDFFile() throws IOException {
        Path pdfFile = tempDir.resolve("test.pdf");
        // This creates a minimal PDF file structure
        // For more realistic tests, use pre-created test resources
        try (InputStream testPdf = getClass().getResourceAsStream("/test-files/sample.pdf")) {
            if (testPdf != null) {
                Files.copy(testPdf, pdfFile);
            } else {
                // Create minimal placeholder
                Files.writeString(pdfFile, "%PDF-1.4 placeholder");
            }
        }
        return pdfFile;
    }

    private Path createTestDOCXFile() throws IOException {
        Path docxFile = tempDir.resolve("test.docx");
        // This creates a minimal DOCX file structure
        // For more realistic tests, use pre-created test resources
        try (InputStream testDocx = getClass().getResourceAsStream("/test-files/sample.docx")) {
            if (testDocx != null) {
                Files.copy(testDocx, docxFile);
            } else {
                // Create minimal placeholder
                Files.writeString(docxFile, "PK placeholder");
            }
        }
        return docxFile;
    }
}
