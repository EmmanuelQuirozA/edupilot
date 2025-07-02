// src/pages/ProtectedFilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation }        from 'react-i18next'
import Layout                    from '../layout/Layout'

export default function ProtectedFilePage() {
  const { t } = useTranslation();
  const { filename } = useParams();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

   // Fetch the protected file with auth header
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${baseUrl}/api/protectedfiles/${filename}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading protected file:', err);
        setError(true);
        setLoading(false);
      });
  }, [filename]);

  const isPdf = filename.toLowerCase().endsWith('.pdf');

  return (
    <Layout pageTitle={t('payments_reports')}>
      <div className="container py-4">
        <h2 className="mb-4">{filename}</h2>
      {!loading && !error && fileUrl && (
        isPdf ? (
          <object
            data={fileUrl}
            type="application/pdf"
            width="100%"
            height="800px"
          >
            <p>
              Your browser does not support PDFs. <a href={fileUrl} download>Download here</a>.
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

      </div>
    </Layout>
  );
}
