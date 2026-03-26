import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface DropZoneProps {
  onFilesSelect?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelect,
  maxFiles = 5,
  maxSize = 5242880, // 5MB
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setError(null);
    onFilesSelect?.(acceptedFiles);
  }, [onFilesSelect]);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const errs = rejections.map(r => `${r.file.name}: ${r.errors[0].message}`);
    setError(errs.join('\n'));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    maxFiles,
    maxSize,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
    },
  });

  return (
    <div className="upload-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop files here...</p> : <p>Drag & drop or click to select files</p>}
      </div>
      {error && <div className="error">{error}</div>}
      {files.length > 0 && (
        <div className="file-list">
          <h4>Selected ({files.length}/{maxFiles}):</h4>
          <ul>
            {files.map(file => (
              <li key={file.name}>{file.name} - {(file.size / 1024).toFixed(2)} KB</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropZone;
