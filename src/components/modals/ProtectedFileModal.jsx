// src/components/ProtectedFileModal.jsx
import React, { useState, useEffect } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent,
  MDBModalHeader, MDBModalTitle, MDBModalBody,
  MDBModalFooter, MDBBtn
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { getProtectedFile } from '../../api/studentApi';

export default function ProtectedFileModal({ filename, filepath, show, onClose }) {
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    setError(false);
    getProtectedFile(filepath)
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      })
      .catch(err => {
        console.error('Error loading protected file:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [filename, show]);

  const isPdf = filename.toLowerCase().endsWith('.pdf');

  return (
    <MDBModal open={show} onClose={onClose}>
      <MDBModalDialog size="lg">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{filename}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={onClose} />
          </MDBModalHeader>

          <MDBModalBody>
            {!loading && !error && fileUrl && (
              isPdf ? (
                <object
                  data={fileUrl}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                >
                  <p>
                    {t('pdf_not_supported')}{' '}
                    <a href={fileUrl} download>{t('download_here')}</a>.
                  </p>
                </object>
              ) : (
                <img
                  src={fileUrl}
                  alt={filename}
                  className="img-fluid"
                />
              )
            )}
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn color="secondary" onClick={onClose}>
              {t('close')}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}