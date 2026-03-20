import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader, Trash2, FileText, AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cvService, TextQuality, CVAnalysisResult } from '../../services/cvService';
import CVAnalysisDisplay from '../../components/CVAnalysisDisplay';

interface CVUploadProps {
  onUploadSuccess?: () => void;
}

// Text Quality Badge Component
const TextQualityBadge: React.FC<{ quality?: TextQuality }> = ({ quality }) => {
  if (!quality) return null;
  
  const config: Record<TextQuality, { bg: string; text: string; label: string; icon: string }> = {
    HIGH: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'High Quality', icon: '✓' },
    MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Medium Quality', icon: '≈' },
    LOW: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Low Quality', icon: '!' },
  };
  
  const { bg, text, label } = config[quality];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${bg} ${text} border-current/20`}>
      {label}
    </span>
  );
};

const CVUpload: React.FC<CVUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [existingCV, setExistingCV] = useState<any>(null);
  const [showFullText, setShowFullText] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadExistingCV();
  }, []);

  const loadExistingCV = async () => {
    try {
      const response = await cvService.getCVInfo();
      if (response.success && response.data) {
        setExistingCV(response.data);
        setSuccess(true);
      }
    } catch (err) {
      console.log('No existing CV found');
    }
  };

  const loadExtractedText = async () => {
    if (showFullText) {
      setShowFullText(false);
      return;
    }

    setLoadingText(true);
    try {
      const response = await cvService.getExtractedText();
      console.log('Extracted text response:', response); // Debug log
      if (response && response.text) {
        setExtractedText(response.text);
        setShowFullText(true);
      } else {
        setError('Failed to load extracted text - no text in response');
      }
    } catch (err: any) {
      console.error('Failed to load extracted text:', err);
      setError(err.response?.data?.message || 'Failed to load extracted text');
    } finally {
      setLoadingText(false);
    }
  };

  const handleAnalyzeCV = async () => {
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await cvService.analyzeCV();
      if (response.success && response.data) {
        setAnalysisResult(response);
      } else {
        setAnalysisError(response.message || 'Failed to analyze CV');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to analyze CV. Please ensure your CV text was extracted successfully.';
      setAnalysisError(errorMessage);
      console.error('CV analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccess(false);

    // Validate file
    const validation = cvService.validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const response = await cvService.uploadCV(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        setSuccess(true);
        // Handle both response structures
        const cvData = response.data || {
          fileName: response.fileName,
          fileSize: response.fileSize,
          fileType: response.fileType,
          uploadedDate: response.uploadedDate,
          textExtracted: response.textExtracted,
          cvTextPreview: response.cvTextPreview,
          textQuality: response.textQuality,
          extractionError: response.extractionError,
        };
        setExistingCV(cvData);
        setFile(null);
        setExtractedText(null);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }

        // Automatically trigger analysis if text was extracted
        if (cvData.textExtracted) {
          setTimeout(() => {
            handleAnalyzeCV();
          }, 500);
        }
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload CV. Please try again.';
      setError(errorMessage);
      console.error('CV upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your CV?')) return;

    try {
      const response = await cvService.deleteCV();
      if (response.success) {
        setExistingCV(null);
        setSuccess(false);
        setFile(null);
        setExtractedText(null);
        setAnalysisResult(null);
        setAnalysisError(null);
      } else {
        setError(response.message || 'Failed to delete CV');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete CV';
      setError(errorMessage);
    }
  };

  const handleReplaceCV = () => {
    setSuccess(false);
    setExistingCV(null);
    setFile(null);
    setError(null);
    setExtractedText(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full">
      {/* Success State - Existing CV */}
      {success && existingCV ? (
        <div className="bg-white/5 rounded-xl p-8 border border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>

          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-center text-white mb-1">
              CV Uploaded Successfully ✅
            </h3>
            <p className="text-zinc-500 text-sm">Your resume is ready for analysis</p>
          </div>

          {/* File Info Card */}
          <div className="bg-black/20 rounded-lg p-4 mb-6 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <File className="w-5 h-5 text-white" />
              <div className="flex-1">
                <p className="font-medium text-zinc-200">{existingCV.fileName}</p>
                <p className="text-xs text-zinc-500">
                  {cvService.formatFileSize(existingCV.fileSize)} • {existingCV.fileType}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Uploaded: {formatDate(existingCV.uploadedDate)}</p>
          </div>

          {/* Text Extraction Status */}
          {existingCV.textExtracted ? (
            <div className="bg-emerald-500/10 rounded-lg p-4 mb-6 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400">Text Extracted Successfully</span>
                <TextQualityBadge quality={existingCV.textQuality} />
              </div>
              
              {existingCV.cvTextPreview && (
                <div className="bg-black/30 rounded-lg p-4 mb-4 border border-white/5 max-h-32 overflow-hidden">
                  <p className="text-sm text-zinc-300 italic leading-relaxed">
                    "{existingCV.cvTextPreview}"
                    {existingCV.cvTextPreview.length > 200 && '...'}
                  </p>
                </div>
              )}

              <button
                onClick={loadExtractedText}
                disabled={loadingText}
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {loadingText ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : showFullText ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Full Text
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show Full Text
                  </>
                )}
              </button>

              {/* Full Text Display */}
              {showFullText && extractedText && (
                <div className="mt-4 bg-black/40 rounded-lg p-4 border border-white/10 max-h-64 overflow-y-auto">
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {extractedText}
                  </p>
                </div>
              )}
            </div>
          ) : existingCV.textExtracted === false ? (
            <div className="bg-orange-500/10 rounded-lg p-4 mb-6 border border-orange-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-500 mb-1">Text Extraction Failed</p>
                  <p className="text-sm text-orange-400/80">
                    {existingCV.extractionError || 'Could not extract text from this file. The document may be corrupted or in an unsupported format.'}
                  </p>
                  <p className="text-xs text-orange-400/70 mt-2">
                    Try uploading a different format or a clearer document.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* AI Analysis Section */}
          {existingCV.textExtracted && (
            <div className="mt-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
              {/* Analysis Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">AI-Powered Analysis</h4>
                </div>
                {analysisResult && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                    ✓ Analyzed
                  </span>
                )}
              </div>

              {/* Analysis Loading State */}
              {analyzing && (
                <CVAnalysisDisplay isLoading={true} analysis={null} />
              )}

              {/* Analysis Results */}
              {!analyzing && analysisResult && (
                <div className="space-y-4">
                  <CVAnalysisDisplay analysis={analysisResult} isLoading={false} />
                </div>
              )}

              {/* Analysis Error */}
              {!analyzing && analysisError && !analysisResult && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-400 mb-1">Analysis Failed</p>
                      <p className="text-xs text-orange-400/80">{analysisError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              {!analyzing && !analysisResult && (
                <button
                  onClick={handleAnalyzeCV}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze CV with AI
                </button>
              )}

              {analysisResult && (
                <button
                  onClick={handleAnalyzeCV}
                  disabled={analyzing}
                  className="w-full mt-4 bg-purple-500/20 text-purple-400 py-2 rounded-lg font-medium hover:bg-purple-500/30 transition-colors border border-purple-500/30 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Re-analyze CV'}
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReplaceCV}
              className="flex-1 bg-white text-black py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Replace CV
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-400 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 hover:text-white transition-all border border-white/5 hover:border-white/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Upload Area */}
          <div
            className={`border border-dashed rounded-xl p-10 text-center transition-all duration-300 ${dragActive
                ? 'border-white bg-white/5 scale-[1.02]'
                : 'border-zinc-700 hover:border-zinc-500 hover:bg-white/[0.02]'
              } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileInput}
              disabled={uploading}
            />

            {!file && !uploading && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                  <Upload className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                  Upload Your CV
                </h3>
                <p className="text-zinc-400 mb-6 max-w-xs mx-auto text-sm leading-relaxed">
                  Drag & drop your CV here, or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
                >
                  Choose File
                </button>
                <p className="text-xs text-zinc-600 mt-6 uppercase tracking-wider font-medium">
                  PDF, DOCX • Max 5MB
                </p>
              </div>
            )}

            {file && !uploading && (
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                  <File className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{file.name}</p>
                  <p className="text-sm text-zinc-500 font-mono mt-1">
                    {cvService.formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleUpload}
                    className="bg-white text-black px-8 py-2.5 rounded-full font-semibold hover:bg-zinc-200 transition-colors shadow-lg"
                  >
                    Upload Now
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    className="bg-transparent text-zinc-400 px-6 py-2.5 rounded-full font-medium hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-6 py-4">
                <div className="relative w-20 h-20 mx-auto">
                  <Loader className="w-20 h-20 text-white/20 animate-spin absolute top-0 left-0" />
                  <Loader className="w-20 h-20 text-white animate-spin absolute top-0 left-0 opacity-50" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <p className="font-semibold text-white mb-4 animate-pulse">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="w-full max-w-xs mx-auto bg-zinc-800 rounded-full h-1">
                    <div
                      className="bg-white h-1 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-medium text-sm">Upload Failed</p>
                <p className="text-red-400/70 text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors p-1 flex-shrink-0"
              >
                <XCircle size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CVUpload;
