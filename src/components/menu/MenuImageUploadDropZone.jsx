// src/components/menu/MenuImageUploadDropZone.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MDBIcon } from 'mdb-react-ui-kit';

export default function MenuImageUploadDropZone({ onImageSet }) {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    setPreview(URL.createObjectURL(file));
    onImageSet(file.name, file);
  }, [onImageSet]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-dashed border-2 border-info rounded p-4 text-center ${isDragActive ? 'bg-light' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      <input {...getInputProps()} />
      {preview ? (
        <img src={preview} alt="Preview" style={{ maxHeight: 200, borderRadius: 8 }} className="img-fluid" />
      ) : (
        <p><MDBIcon fas icon="cloud-upload-alt" className="me-2" /> Drag & drop or click to upload</p>
      )}
    </div>
  );
}
