import React, { useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { DropzoneArea } from "react-mui-dropzone";

import { apiClient } from "@/shared/services/apiClient";

export function DropZone() {
  const [progress, setProgress] = useState<number | null>(null);

  const handleUpload = async (files: File[]) => {
    if (!files[0]) return;

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      setProgress(0);
      const onUploadProgress = (e: ProgressEvent) => {
        const percent = (e.loaded / e.total) * 100;
        setProgress(percent);
      };

      const response = await apiClient.post("/api/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      });

      console.log("Uploaded file ID:", response.data.id);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setProgress(null);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Upload a file
      </Typography>

      <DropzoneArea
        onChange={handleUpload}
        maxFileSize={5 * 1024 * 1024} // 5 MB
        acceptedFiles={["image/*", "application/*", "text/*"]}
        showFileNames
        showFileNamesInPreview
      />

      {progress !== null && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
    </Box>
  );
}
