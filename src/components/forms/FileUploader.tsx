import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle, X } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export function FileUploader({ onUpload, isLoading = false }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpg',
      'image/jpeg',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Allowed file types: PDF, DOC, DOCX, PNG, JPG, JPEG');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Max limit is 10MB.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload attachment');
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-violet-500 bg-violet-50/20 dark:bg-violet-950/10'
            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        />

        <UploadCloud className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        <p className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          Click to upload or drag & drop files
        </p>
        <p className="mt-1 text-3xs text-zinc-400">
          PDF, Word, PNG, or JPEG (Max 10MB)
        </p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-medium text-zinc-700 truncate max-w-[180px] dark:text-zinc-300">
              {selectedFile.name}
            </span>
            <span className="text-3xs text-zinc-400">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            
            <button
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                handleUploadClick();
              }}
              className="inline-flex h-7 items-center justify-center rounded-lg bg-violet-600 px-3 text-2xs font-semibold text-white shadow-xs hover:bg-violet-500 disabled:opacity-50"
            >
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
