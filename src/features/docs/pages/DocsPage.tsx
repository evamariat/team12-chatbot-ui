import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';
import { Button } from '@/components/ui/button'; // shadcn
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

const maxFiles = 10;
const maxSize = 10 * 1024 * 1024; // 10MB

const DocsPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejections: FileRejection[]) => {
    if (acceptedFiles.length) {
      setFiles(prev => [...prev, ...acceptedFiles]);
      setError(null);
      setSuccess(false);
    }
    if (rejections.length) {
      setError(rejections[0].errors[0]?.message || 'Upload rejected');
    }
  }, []);

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    maxFiles,
    maxSize,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.md'],
      'image/*': [],
    },
    multiple: true,
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    files.forEach((file, idx) => {
      formData.append('files', file);
      formData.append('filename', file.name);
    });

    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setSuccess(true);
            setFiles([]);
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', '/api/docs/upload'); // Proxy to Spring Boot /documents
        xhr.send(formData);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/">← Back to Chat</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drag & Drop Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`dropzone border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
              isDragActive
                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-xl text-primary">
                Drop the files here ...
              </p>
            ) : (
              <p className="text-lg text-muted-foreground mb-2">
                Drag & drop documents here, or click to select
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Supports PDF, TXT, MD (max {maxFiles} files, {maxSize / 1024 / 1024}MB each)
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
              {error}
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-4">Selected Files ({files.length}/{maxFiles})</h3>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="font-medium truncate flex-1">{file.name}</span>
                    <span className="text-sm text-muted-foreground mr-4">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(idx)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="flex-1"
              size="lg"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </Button>
            {uploading && (
              <div className="w-full mt-4">
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>

          {success && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-700">
              Files uploaded successfully to vector DB!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocsPage;
