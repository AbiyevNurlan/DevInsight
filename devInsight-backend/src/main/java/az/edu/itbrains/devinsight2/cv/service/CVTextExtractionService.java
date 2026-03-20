package az.edu.itbrains.devinsight2.cv.service;

import az.edu.itbrains.devinsight2.cv.enums.TextQuality;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.regex.Pattern;

/**
 * Service for extracting text content from CV files (PDF and DOCX)
 */
@Service
@Slf4j
public class CVTextExtractionService {

    // Patterns for cleaning text
    private static final Pattern MULTIPLE_WHITESPACE = Pattern.compile("\\s{2,}");
    private static final Pattern MULTIPLE_NEWLINES = Pattern.compile("\\n{3,}");
    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]");
    private static final Pattern PAGE_NUMBERS = Pattern.compile("(?m)^\\s*(?:Page\\s*)?\\d+\\s*(?:of\\s*\\d+)?\\s*$");
    private static final Pattern HEADER_FOOTER = Pattern.compile("(?m)^\\s*(?:Curriculum Vitae|CV|Resume|Page \\d+)\\s*$");

    // Minimum text length to consider extraction successful
    private static final int MIN_TEXT_LENGTH = 50;
    private static final int MEDIUM_TEXT_LENGTH = 200;
    private static final int HIGH_TEXT_LENGTH = 500;

    /**
     * Result class containing extracted text and quality assessment
     */
    public static class ExtractionResult {
        private final String text;
        private final TextQuality quality;
        private final String errorMessage;
        private final boolean success;

        private ExtractionResult(String text, TextQuality quality, String errorMessage, boolean success) {
            this.text = text;
            this.quality = quality;
            this.errorMessage = errorMessage;
            this.success = success;
        }

        public static ExtractionResult success(String text, TextQuality quality) {
            return new ExtractionResult(text, quality, null, true);
        }

        public static ExtractionResult failure(String errorMessage) {
            return new ExtractionResult(null, TextQuality.LOW, errorMessage, false);
        }

        public String getText() { return text; }
        public TextQuality getQuality() { return quality; }
        public String getErrorMessage() { return errorMessage; }
        public boolean isSuccess() { return success; }
    }

    /**
     * Extract text from a CV file (PDF or DOCX)
     */
    public ExtractionResult extractText(Path filePath) {
        log.info("Extracting text from CV: {}", filePath);

        File file = filePath.toFile();
        if (!file.exists()) {
            log.error("File not found: {}", filePath);
            return ExtractionResult.failure("File not found");
        }

        String fileName = file.getName().toLowerCase();
        
        try {
            String rawText;
            if (fileName.endsWith(".pdf")) {
                rawText = extractFromPDF(file);
            } else if (fileName.endsWith(".docx")) {
                rawText = extractFromDOCX(file);
            } else {
                return ExtractionResult.failure("Unsupported file type. Only PDF and DOCX are supported.");
            }

            // Clean and normalize extracted text
            String cleanedText = cleanText(rawText);
            
            // Assess quality
            TextQuality quality = assessQuality(cleanedText);
            
            log.info("Text extraction successful. Length: {}, Quality: {}", cleanedText.length(), quality);
            return ExtractionResult.success(cleanedText, quality);

        } catch (IOException e) {
            log.error("Failed to read file: {}", e.getMessage());
            return ExtractionResult.failure(e.getMessage());
        } catch (Exception e) {
            log.error("Text extraction failed: {}", e.getMessage(), e);
            return ExtractionResult.failure("Failed to extract text: " + e.getMessage());
        }
    }

    /**
     * Extract text from PDF using Apache PDFBox
     */
    private String extractFromPDF(File file) throws IOException {
        log.debug("Extracting text from PDF: {}", file.getName());
        
        try (PDDocument document = Loader.loadPDF(file)) {
            // Check if document is encrypted
            if (document.isEncrypted()) {
                throw new IOException("The PDF file is password protected. Please upload an unprotected file.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            stripper.setAddMoreFormatting(true);
            
            String text = stripper.getText(document);
            
            // Check for scanned PDF (image-based with no text)
            if (text == null || text.trim().length() < MIN_TEXT_LENGTH) {
                log.warn("PDF appears to be scanned (image-based). Limited text extracted.");
                if (text == null || text.trim().isEmpty()) {
                    throw new IOException("This appears to be a scanned PDF. Please upload a text-based PDF or DOCX file for better results.");
                }
            }
            
            return text;
        }
    }

    /**
     * Extract text from DOCX using Apache POI
     */
    private String extractFromDOCX(File file) throws IOException {
        log.debug("Extracting text from DOCX: {}", file.getName());
        
        StringBuilder text = new StringBuilder();
        
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            // Extract paragraphs
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String paragraphText = paragraph.getText();
                if (paragraphText != null && !paragraphText.trim().isEmpty()) {
                    text.append(paragraphText).append("\n");
                }
            }
            
            // Extract text from tables
            for (XWPFTable table : document.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    StringBuilder rowText = new StringBuilder();
                    for (XWPFTableCell cell : row.getTableCells()) {
                        String cellText = cell.getText();
                        if (cellText != null && !cellText.trim().isEmpty()) {
                            if (rowText.length() > 0) {
                                rowText.append(" | ");
                            }
                            rowText.append(cellText.trim());
                        }
                    }
                    if (rowText.length() > 0) {
                        text.append(rowText).append("\n");
                    }
                }
                text.append("\n");
            }
        }
        
        return text.toString();
    }

    /**
     * Clean and normalize extracted text
     */
    private String cleanText(String rawText) {
        if (rawText == null || rawText.isEmpty()) {
            return "";
        }

        String cleaned = rawText;
        
        // Remove control characters
        cleaned = CONTROL_CHARS.matcher(cleaned).replaceAll("");
        
        // Remove common headers/footers
        cleaned = HEADER_FOOTER.matcher(cleaned).replaceAll("");
        
        // Remove page numbers
        cleaned = PAGE_NUMBERS.matcher(cleaned).replaceAll("");
        
        // Normalize whitespace
        cleaned = MULTIPLE_WHITESPACE.matcher(cleaned).replaceAll(" ");
        
        // Normalize newlines (keep paragraph structure)
        cleaned = MULTIPLE_NEWLINES.matcher(cleaned).replaceAll("\n\n");
        
        // Trim
        cleaned = cleaned.trim();
        
        return cleaned;
    }

    /**
     * Assess the quality of extracted text
     */
    private TextQuality assessQuality(String text) {
        if (text == null || text.isEmpty()) {
            return TextQuality.LOW;
        }

        int length = text.length();
        
        // Check for meaningful content indicators
        boolean hasEmailOrPhone = text.matches("(?s).*[\\w.-]+@[\\w.-]+.*") || 
                                  text.matches("(?s).*\\+?\\d[\\d\\s()-]{8,}.*");
        boolean hasSections = text.toLowerCase().matches("(?s).*(experience|education|skills|work|summary|objective|projects).*");
        boolean hasProperStructure = text.split("\n").length > 5;
        
        int qualityScore = 0;
        if (length >= HIGH_TEXT_LENGTH) qualityScore += 3;
        else if (length >= MEDIUM_TEXT_LENGTH) qualityScore += 2;
        else if (length >= MIN_TEXT_LENGTH) qualityScore += 1;
        
        if (hasEmailOrPhone) qualityScore += 1;
        if (hasSections) qualityScore += 2;
        if (hasProperStructure) qualityScore += 1;
        
        if (qualityScore >= 5) return TextQuality.HIGH;
        if (qualityScore >= 3) return TextQuality.MEDIUM;
        return TextQuality.LOW;
    }

    /**
     * Get a preview of extracted text (first N characters)
     */
    public String getTextPreview(String text, int maxLength) {
        if (text == null || text.isEmpty()) {
            return "";
        }
        
        if (text.length() <= maxLength) {
            return text;
        }
        
        // Try to cut at word boundary
        int cutIndex = text.lastIndexOf(' ', maxLength);
        if (cutIndex < maxLength * 0.7) {
            cutIndex = maxLength;
        }
        
        return text.substring(0, cutIndex) + "...";
    }
}
