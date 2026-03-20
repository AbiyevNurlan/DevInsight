import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader, Trash2, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import { cvService, TextQuality } from './cvService';

interface CVUploadProps {
  onUploadSuccess?: () => void;
}

// Text Quality Badge Component
const TextQualityBadge: React.FC<{ quality?: TextQuality }> = ({ quality }) => {
  if (!quality) return null;
  
  const config: Record<TextQuality, { bg: string; text: string; label: string }> = {
    HIGH: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'High Quality' },
    MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Medium Quality' },
    LOW: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Low Quality' },
  };
  
  const { bg, text, label } = config[quality];
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border border-white/5 ${bg} ${text}`}>
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
      console.log('No existing CV');
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

    try {
      const response = await cvService.uploadCV(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        setSuccess(true);
        setExistingCV(response.data);
        setFile(null);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete your CV?')) return;

    try {
      const response = await cvService.deleteCV();
      if (response.success) {
        setExistingCV(null);
        setSuccess(false);
        setFile(null);
      } else {
        setError(response.message || 'Failed to delete');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleReplaceCV = () => {
    setSuccess(false);
    setExistingCV(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {success && existingCV ? (
        <div className="bg-zinc-950/40 backdrop-blur-2xl rounded-xl shadow-lg p-8 border border-white/10">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-center text-white mb-2">
            CV Uploaded Successfully!
          </h3>
          <div className="bg-black/20 rounded-lg p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <File className="w-5 h-5 text-zinc-300" />
              <span className="font-medium text-zinc-200">{existingCV.fileName}</span>
            </div>
            <div className="text-sm text-zinc-400 space-y-1">
              <p>Size: {cvService.formatFileSize(existingCV.fileSize)}</p>
              <p>Type: {existingCV.fileType}</p>
              <p>Uploaded: {formatDate(existingCV.uploadedDate)}</p>
              {existingCV.isAnalyzed && (
                <p className="text-emerald-400 font-medium">✓ Analyzed</p>
              )}
            </div>
          </div>

          {/* Text Extraction Status */}
          {existingCV.textExtracted ? (
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-zinc-300" />
                <span className="font-medium text-zinc-200">Text Extracted</span>
                <TextQualityBadge quality={existingCV.textQuality} />
              </div>
              {existingCV.cvTextPreview && (
                <div className="bg-black/20 rounded-lg p-3 mt-2 border border-white/10">
                  <p className="text-sm text-zinc-400 italic line-clamp-4">
                    "{existingCV.cvTextPreview}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-500/10 rounded-lg p-4 mb-6 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-yellow-500">Text Extraction Failed</span>
              </div>
              <p className="text-sm text-yellow-600/80">
                {existingCV.extractionError || 'Could not extract text from this file.'}
              </p>
              <p className="text-sm text-yellow-500/80 mt-1">
                Try uploading a different format or a clearer document.
              </p>
            </div>
          )}

          {/* Analyze CV Button */}
          {existingCV.textExtracted && !existingCV.isAnalyzed && (
            <button
              onClick={() => alert('AI Analysis will be implemented in Step 3!')}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-zinc-200 transition mb-4 flex items-center justify-center gap-2 border border-transparent hover:border-white/10"
            >
              <Sparkles className="w-5 h-5" />
              Analyze CV with AI
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReplaceCV}
              className="flex-1 bg-white text-black py-3 rounded-lg font-semibold hover:bg-zinc-200 transition"
            >
              Replace CV
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 hover:text-white transition border border-white/5 hover:border-white/10"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`border border-dashed rounded-xl p-8 text-center transition ${
              dragActive
                ? 'border-white bg-white/5'
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
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
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Upload className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Your CV</h3>
                <p className="text-zinc-400 mb-4">
                  Drag & drop your CV here, or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-zinc-200 transition shadow-lg"
                >
                  Choose File
                </button>
                <p className="text-sm text-zinc-500 mt-4">
                  Supported: PDF, DOCX • Max: 5MB
                </p>
              </>
            )}

            {file && !uploading && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                  <File className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-zinc-500">
                    {cvService.formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleUpload}
                    className="bg-white text-black px-8 py-2.5 rounded-full font-semibold hover:bg-zinc-200 transition"
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    className="bg-transparent text-zinc-400 px-6 py-2.5 rounded-full font-medium hover:text-white hover:bg-white/5 transition border border-transparent hover:border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-4">
                <Loader className="w-16 h-16 text-white/50 mx-auto animate-spin" />
                <div>
                  <p className="font-semibold text-white mb-2">
                    Uploading... {uploadProgress}%
                  </p>
                  <div className="w-full bg-zinc-800 rounded-full h-1">
                    <div
                      className="bg-white h-1 rounded-full transition-all box-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-medium">Upload Failed</p>
                <p className="text-red-400/70 text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                ×
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CVUpload;
