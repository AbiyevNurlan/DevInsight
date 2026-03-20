import axios from './api';

export type TextQuality = 'HIGH' | 'MEDIUM' | 'LOW';
export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR';

export interface CVUploadResponse {
  success: boolean;
  message: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedDate?: string;
  textExtracted?: boolean;
  cvTextPreview?: string;
  textQuality?: TextQuality;
  extractionError?: string;
  data?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedDate: string;
    textExtracted?: boolean;
    cvTextPreview?: string;
    textQuality?: TextQuality;
    extractionError?: string;
    isAnalyzed?: boolean;
  };
}

export interface ExtractedTextResponse {
  text: string;
  quality: TextQuality;
  wordCount: number;
}

export interface CVAnalysisResult {
  success: boolean;
  message: string;
  data?: {
    skills: string[];
    experienceLevel: ExperienceLevel;
    categories: string[];
    yearsOfExperience: number;
    education: string;
    languages: string[];
    summary: string;
  };
}

export interface CVInfo {
  success: boolean;
  message?: string;
  data?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedDate: string;
    textExtracted?: boolean;
    cvTextPreview?: string;
    textQuality?: TextQuality;
    extractionError?: string;
    isAnalyzed?: boolean;
    analysisDate?: string;
  };
}

export const cvService = {
  /**
   * Upload CV file
   */
  uploadCV: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<CVUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  /**
   * Get current user's CV info
   */
  getCVInfo: async (): Promise<CVInfo> => {
    const response = await axios.get('/cv/info');
    return response.data;
  },

  /**
   * Delete current user's CV
   */
  deleteCV: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete('/cv');
    return response.data;
  },

  /**
   * Get extracted text from CV
   */
  getExtractedText: async (): Promise<ExtractedTextResponse> => {
    const response = await axios.get('/cv/text');
    return response.data;
  },

  /**
   * Validate file before upload
   */
  validateFile: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 5MB',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only PDF and DOCX files are allowed',
      };
    }

    return { valid: true };
  },

  /**
   * Analyze CV using AI to extract skills, experience level, and job categories
   */
  analyzeCV: async (): Promise<CVAnalysisResult> => {
    const response = await axios.post('/candidates/cv/analyze');
    return response.data;
  },

  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },
};
