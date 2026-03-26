'use client'; // For Next.js
import React, { useState } from 'react';
import DropZone from './components/DropZone'; // Adjust path

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      alert('Upload successful!');
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>File Upload</h1>
      <DropZone onFilesSelect={handleFilesSelect} />
      <button 
        onClick={handleUpload} 
        disabled={files.length === 0 || uploading}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
      </button>
    </div>
  );
}
