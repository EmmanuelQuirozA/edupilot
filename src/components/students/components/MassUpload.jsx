// src/components/students/components/MassUpload.jsx
import React, { useState, useCallback } from 'react';
import {
  MDBSpinner,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBRow,
  MDBCol,
  MDBBtn
} from 'mdb-react-ui-kit';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import swal from 'sweetalert';
import { useTranslation } from 'react-i18next';
import { createStudents } from '../../../api/studentsApi'; // our batch‐create helper

export default function MassUploadContent({
  school_id,
  group_id,
  onUploadSuccess,
  onClose
}) {
  const { t, i18n } = useTranslation();
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1) Validate a single CSV row:
  const validateRow = (row, idx) => {
    const errors = [];
    if (!row.first_name || row.first_name.trim() === '') {
      errors.push(`${t('first_name')} ${t('is_required')} (Row ${idx + 1})`);
    }
    if (!row.last_name_father || row.last_name_father.trim() === '') {
      errors.push(`${t('last_name_father')} ${t('is_required')} (Row ${idx + 1})`);
    }
    if (!row.last_name_mother || row.last_name_mother.trim() === '') {
      errors.push(`${t('last_name_mother')} ${t('is_required')} (Row ${idx + 1})`);
    }
    if (!row.username || row.username.trim() === '') {
      errors.push(`${t('username')} ${t('is_required')} (Row ${idx + 1})`);
    }
    if (!row.password || row.password.trim() === '') {
      errors.push(`${t('password')} ${t('is_required')} (Row ${idx + 1})`);
    }
    if (!row.email || row.email.trim() === '') {
      errors.push(`${t('email')} ${t('is_required')} (Row ${idx + 1})`);
    }
    if (!row.register_id || row.register_id.trim() === '') {
      errors.push(`${t('register_id')} ${t('is_required')} (Row ${idx + 1})`);
    }
    return errors;
  };

  // 2) Detect duplicate usernames in the batch:
  const validateDuplicates = (rows) => {
    const usernameMap = {};
    const duplicates = [];
    rows.forEach((row, idx) => {
      if (row.username) {
        const uname = row.username.trim().toLowerCase();
        if (usernameMap[uname] !== undefined && !duplicates.includes(uname)) {
          duplicates.push(uname);
        } else {
          usernameMap[uname] = idx;
        }
      }
    });
    return duplicates;
  };

  // 3) Handle drop/parse CSV:
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        let text = event.target.result;
        // Strip BOM if present:
        text = text.replace(/^\uFEFF/, '');
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Map each row, setting defaults if missing
            const data = results.data.map((row) => ({
              ...row,
              role_id: 4, // Student role
              school_id: row.school_id || school_id,
              group_id: row.group_id || group_id
            }));

            // Validate each row
            let errors = [];
            data.forEach((row, idx) => {
              const rowErrs = validateRow(row, idx);
              if (rowErrs.length) errors = errors.concat(rowErrs);
            });
            // Check duplicates
            const duplicates = validateDuplicates(data);
            if (duplicates.length) {
              errors.push(`${t('duplicate_usernames')}: ${duplicates.join(', ')}`);
            }

            setParsedData(data);
            setValidationErrors(errors);
          },
          error: (err) => {
            console.error('Error parsing CSV:', err);
            swal(t('error_title'), t('csv_parsing_failed'), 'error');
          }
        });
      };
      reader.readAsText(file, 'UTF-8');
    },
    [school_id, group_id, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.csv'
  });

  // 4) Upload to backend in one batch:
  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      swal(t('error_title'), t('please_fix_errors_before_upload'), 'error');
      return;
    }
    if (!parsedData.length) {
      swal(t('error_title'), t('no_data_to_upload'), 'warning');
      return;
    }

    setIsUploading(true);
    try {
      // Send the entire parsedData array to createStudents
      const res = await createStudents(parsedData, i18n.language);
      if (res.success === false) {
        swal(res.title, res.message, res.type);
      } else {
        swal(res.title, res.message, res.type);
        onUploadSuccess();
      }
    } catch (err) {
      console.error('Error uploading students:', err);
      swal(t('error_title'), t('upload_failed'), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>{t('drop_the_file_here')}</p>
        ) : (
          <p>{t('drag_and_drop_a_csv_file_here_or_click_to_select')}</p>
        )}
      </div>

      {/* Preview Table & Errors */}
      {parsedData.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h6>{t('preview')}</h6>

          {validationErrors.length > 0 && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              {validationErrors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          )}

          <MDBRow>
            <MDBCol style={{ maxHeight: '400px', overflow: 'auto' }}>
              <MDBTable responsive striped>
                <MDBTableHead>
                  <tr>
                    {Object.keys(parsedData[0]).map((key, idx) => (
                      <th key={idx}>{t(key)}</th>
                    ))}
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {parsedData.map((row, ridx) => (
                    <tr key={ridx}>
                      {Object.keys(row).map((key, cidx) => (
                        <td key={cidx}>{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </MDBCol>
          </MDBRow>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="d-flex justify-content-end mt-3">
        <MDBBtn color="secondary" onClick={onClose} disabled={isUploading}>
          {isUploading ? <MDBSpinner size="sm" /> : t('cancel')}
        </MDBBtn>
        <MDBBtn
          color="primary"
          onClick={handleUpload}
          disabled={isUploading || parsedData.length === 0}
        >
          {isUploading ? <MDBSpinner size="sm" /> : t('upload')}
        </MDBBtn>
      </div>
    </>
  );
}
