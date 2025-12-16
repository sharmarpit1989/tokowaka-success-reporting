/**
 * useFileUpload Hook
 * Custom hook for handling file uploads with progress tracking
 */

import { useState, useCallback } from 'react';

export function useFileUpload(uploadFunction) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const upload = useCallback(async (...args) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setResult(null);

      const onProgress = (percentCompleted) => {
        setProgress(percentCompleted);
      };

      const response = await uploadFunction(...args, onProgress);
      setResult(response);
      setProgress(100);
      return response;
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [uploadFunction]);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    result,
    upload,
    reset
  };
}

export default useFileUpload;

