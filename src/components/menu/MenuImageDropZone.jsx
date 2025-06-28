import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { MDBSpinner, MDBIcon } from 'mdb-react-ui-kit';
import swal from 'sweetalert';
import api from '../../api/api';

export default function MenuImageDropZone({
  menuId,
  currentFilename,
  onImageSet,
  t,
  lang
}) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const objectUrlRef = useRef(null);
  const latestFetchId = useRef(0); // To guard against race conditions

  // Always derive the expected filename
  const filename = currentFilename;

  // Fetch image securely by filename, with race condition guard
  const fetchImageBlob = async (filename, fetchId) => {
    try {
      const response = await api.get(`/api/coffee-menu-image/${filename}`, {
        responseType: 'blob'
      });

      // Only update if this is the latest fetch
      if (fetchId !== latestFetchId.current) return;

      const objectUrl = URL.createObjectURL(response.data);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
    } catch (err) {
      if (fetchId === latestFetchId.current) {
        console.error('Failed to fetch image:', err);
        setPreviewUrl('');
      }
    }
  };

  useEffect(() => {
    if (menuId) {
      const fetchId = Date.now(); // unique timestamp
      latestFetchId.current = fetchId;
      fetchImageBlob(filename, fetchId);
    }

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [menuId]);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections.length) {
      swal(t('error'), t('only_jpg_allowed'), 'error');
      return;
    }
    if (!acceptedFiles.length) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('image', file); // Must match @RequestParam name in backend

    setUploading(true);
    try {
      const res = await api.put(
        `/api/coffee/update/${menuId}?lang=${lang}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const newFilename = res.data.new_image;
      onImageSet(newFilename);

      const fetchId = Date.now();
      latestFetchId.current = fetchId;
      await fetchImageBlob(newFilename, fetchId);

      swal(t('success'), t('image_uploaded'), 'success');
    } catch (err) {
      console.error(err);
      swal(err.response.data.title, err.response.data.message, 'error');
    } finally {
      setUploading(false);
    }
  }, [menuId, lang, onImageSet, t]);

  const handleRemoveImage = async () => {
    setUploading(true);
    try {
      await api.put(`/api/coffee/update/${menuId}?lang=${lang}&removeImage=true`);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl('');
      onImageSet(null);
      swal(t('success'), t('image_removed'), 'success');
    } catch (err) {
      console.error(err);
      swal(t('error'), t('failed_to_remove_image'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'image/jpeg': [] }
  });

  return (
    <div
      {...getRootProps()}
      className={`position-relative border-dashed border-2 border-info rounded p-4 text-center ${
        isDragActive ? 'bg-light' : ''
      }`}
      style={{ cursor: 'pointer' }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <MDBSpinner />
      ) : previewUrl ? (
        <div className="position-relative d-inline-block">
          <img
            src={previewUrl}
            alt="Menu"
            style={{ maxHeight: 220, borderRadius: 8 }}
            className="img-fluid mb-2"
          />
          <MDBIcon
            fas
            icon="times-circle"
            className="position-absolute top-0 end-0 text-danger"
            style={{
              cursor: 'pointer',
              fontSize: '1.2rem',
              margin: '4px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            title={t('remove_image')}
          />
        </div>
      ) : (
        <p>
          <MDBIcon fas icon="cloud-upload-alt" className="me-2" />
          {t('drag_drop_or_click_to_upload')}
        </p>
      )}
    </div>
  );
}
