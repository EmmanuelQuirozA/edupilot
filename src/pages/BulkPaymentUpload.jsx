import React, { useEffect, useRef, useState } from 'react';
import { MDBBtn, MDBCard, MDBCardBody, MDBInput, MDBTable, MDBTableHead, MDBTableBody, MDBCol, MDBRow, MDBIcon } from 'mdb-react-ui-kit';
import { useDropzone }               from 'react-dropzone';
import Papa from 'papaparse';
import swal from 'sweetalert';
import axios from 'axios';
import Layout from '../layout/Layout';
import { getClassesCatalog } from '../api/classesApi';
import { getSchools } from '../api/schoolsApi';
import { useTranslation } from 'react-i18next';
import api from '../api/api';

export default function BulkPaymentUpload() {
  const { t,i18n } = useTranslation();
  const [csvData, setCsvData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [schools, setSchools] = useState([]);
  const [paymentConcepts, setPaymentConcepts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [validatingRows, setValidatingRows] = useState(new Set());
  const validationTimeouts = useRef({});

  const [file, setFile]       = useState(null);
  
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const [formData, setFormData] = useState({ school_id: '' });


  useEffect(() => {
    getClassesCatalog(i18n.language)
      .then(setClasses)
      .catch(err => console.error('Error loading scholar levels:', err));
    getSchools(i18n.language)
      .then(res => {
        setSchools(res);
        if (res.length > 0) {
          // Set first school_id in formData
          setFormData(fd => ({ ...fd, school_id: res[0].school_id }));

          // Set school_id in each student row (if any already parsed)
          setCsvData(data => data.map(row => ({
            ...row,
            school_id: res[0].school_id
          })));
        }
      })
      .catch(err => console.error('Error loading schools:', err));
    
    api.get('/api/catalog/payment-concepts', { params: { lang: i18n.language } })
      .then(res => setPaymentConcepts(res.data))
      .catch(err => console.error('Error loading payment concepts', err));

    api.get('/api/catalog/payment-through', { params: { lang: i18n.language } })
      .then(res => setPaymentMethods(res.data))
      .catch(err => console.error('Error loading payment methods', err));

  }, [i18n.language]);

  const debouncedValidateRow = (row, index) => {
    // Clear any existing timeout for this row
    clearTimeout(validationTimeouts.current[index]);

    setValidatingRows(prev => new Set(prev).add(index));

    // Set a new timeout for validation
    validationTimeouts.current[index] = setTimeout(async () => {
      setValidatingRows(prev => {
        const updated = new Set(prev);
        updated.delete(index);
        return updated;
      });
    }, 1500); // 1.5 seconds debounce
  };

  const requiredHeaders = [
    'register_id', 'payment_month', 'amount',
    'payment_through_id', 'payment_concept_id'
  ];
  const displayHeaders = [
  'register_id', 'full_name', 'student_id', // student_id hidden, full_name read-only
  'payment_month', 'amount', 'comments',
  'payment_through_id', 'payment_concept_id'
  ];

  const handleFieldChange = async (index, field, value) => {
    // 1. Update value immediately
    setCsvData(data => {
      const updated = [...data];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // 2. Debounce or trigger validation (if needed)
    debouncedValidateRow({ ...csvData[index], [field]: value }, index);

    // 3. Handle register_id updates
    if (field === 'register_id') {
      try {
        const resp = await api.get(`${baseUrl}/api/students`, {
          params: {
            lang: i18n.language,
            offset: 0,
            limit: 10,
            export_all: false,
            register_id: value
          }
        });

        const student = resp.data?.content?.[0];

        setCsvData(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            register_id: value,
            full_name: student?.full_name || '',
            student_id: student?.student_id || ''
          };
          return updated;
        });

        // Update errors
        setErrors(prevErrors => {
          const filtered = prevErrors.filter(e => e.rowIndex !== index);
          if (!student) {
            return [
              ...filtered,
              { rowIndex: index, messages: ['student_not_found_for_register_id'] }
            ];
          }
          return filtered;
        });

      } catch (error) {
        console.error('Error fetching student info:', error);

        setCsvData(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            full_name: '',
            student_id: ''
          };
          return updated;
        });

        setErrors(prevErrors => {
          const filtered = prevErrors.filter(e => e.rowIndex !== index);
          return [
            ...filtered,
            { rowIndex: index, messages: ['error_fetching_student_info'] }
          ];
        });
      }
    }
  };



  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = results.data;
        const newErrors = [];

        const enrichedData = await Promise.all(parsed.map(async (row, i) => {
          const enrichedRow = { ...row };
          const rowErrors = [];

          // Fetch full_name and student_id based on register_id
          if (row.register_id) {
            try {
              const res = await api.get(`${baseUrl}/api/students`, {
                params: {
                  lang: i18n.language,
                  offset: 0,
                  limit: 10,
                  export_all: false,
                  register_id: row.register_id
                }
              });
              const student = res.data?.content?.[0];
              if (student) {
                enrichedRow.full_name = student.full_name;
                enrichedRow.student_id = student.student_id;
              } else {
                enrichedRow.full_name = '';
                enrichedRow.student_id = '';
                rowErrors.push('student_not_found_for_register_id');
              }
            } catch (err) {
              console.error(`Error fetching student for register_id ${row.register_id}`, err);
              rowErrors.push('error_fetching_student_info');
            }
          }

          if (rowErrors.length > 0) {
            newErrors.push({ rowIndex: i, messages: rowErrors });
          }

          return enrichedRow;
        }));

        setCsvData(enrichedData);
        setErrors(newErrors);
      },
      error: (err) => {
        swal('Error', t('could_not_parse_csv'), 'error');
      }
    });
  };

  const handleUpload = async () => {
    const validRows = csvData.filter((_, i) => !errors.find(err => err.rowIndex === i))
      .map(row => ({
        student_id: row.student_id,
        payment_month: row.payment_month,
        amount: parseFloat(row.amount),
        comments: row.comments,
        payment_through_id: parseInt(row.payment_through_id),
        payment_concept_id: parseInt(row.payment_concept_id),
      }));

    if (!validRows.length) return swal('Error', t('no_valid_records_to_upload'), 'warning');

    try {
      const res = await api.post(`${baseUrl}/api/payments/create/bulk?lang=${i18n.language}`, validRows);
      swal(res.data.title, res.data.message, res.data.type);
      setCsvData([]);
      setErrors([]);
    } catch (err) {
      console.error(err);
      swal('Error', t('upload_failed'), 'error');
    }
  };


  return (
    <Layout pageTitle={t('bulk_payment_upload')}>
      <section className="home-section">
        <div className="content-wrapper">
          <MDBRow className="justify-content-center">
            <MDBCol lg="10" md="10">
              <MDBCard className="custom-card p-4 shadow-4">
                <MDBCardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">{t('bulk_payment_upload')}</h4>
                  </div>

                  {/* 1. Layout download */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">1. {t('download_layout')}</label>
                    <p className="text-muted">
                      {t('layout_instructions')}
                    </p>
                    <MDBBtn color="success" className="w-100" onClick={async () => {
                      try {
                        const response = await api.get('/api/bulkfile/payments_bulk_upload.csv', {
                          responseType: 'blob' // Important to handle binary data
                        });

                        // Create a link to trigger the download
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'payments_bulk_upload.csv'); // Set default filename
                        document.body.appendChild(link);
                        link.click();

                        // Clean up
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading layout:', error);
                        swal('Error', 'Could not download the layout file', 'error');
                      }
                    }}>
                      <MDBIcon fas icon="file-archive" className="me-2" />
                      {t('download_layout')}
                    </MDBBtn>
                  </div>

                  {/* 2. File upload */}
                  <div className="mb-4">
                    <label htmlFor="fileUploadInput" className="form-label fw-bold">
                      2. {t('upload_file')}
                    </label>
                    <div
                      className={`border-2 border-secondary rounded drop-zone-box text-center p-4 bg-light drop-zone`}
                      style={{borderStyle:'dashed'}}
                      role="button"
                      onClick={() => document.getElementById('fileUploadInput').click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files.length > 0) handleFileUpload({ target: { files } });
                      }}
                    >
                      <div className="text-primary drop-zone-icon mb-2">
                        <MDBIcon fas icon="cloud-upload-alt" size="2x" />
                      </div>
                      <span>{t('drag_or_click')}</span>
                      <p/>
                      <small className='text-muted'>{t('supported_files')}: .csv</small>
                      <input
                        type="file"
                        id="fileUploadInput"
                        className="d-none"
                        accept=".csv"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  {/* 4. Preview table */}
                  {csvData.length > 0 && (
                    <>
                      <div className="mb-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                          <MDBTable responsive className="w-100" style={{ tableLayout: 'fixed' }}>
                            <colgroup>
                              <col style={{ width: '40px', minWidth: '40px' }} /> {/* Columna # */}
                              {displayHeaders.map((h, idx) => (
                                <col
                                  key={idx}
                                  style={{
                                    width:
                                      h === 'email' || h === 'personal_email' || h === 'username'
                                        ? '180px'
                                        : h === 'first_name' || h === 'last_name_father' || h === 'last_name_mother'
                                        ? '120px'
                                        : h === 'group_id'
                                        ? '140px'
                                        : '100px',
                                    minWidth: '200px',
                                  }}
                                  className={h === 'student_id' ? 'd-none' : ''}
                                />
                              ))}
                            </colgroup>

                            <MDBTableHead>
                              <tr>
                                <th>#</th>
                                {displayHeaders.map((h) => (
                                  <th key={h} className={h === 'student_id' ? 'd-none' : ''}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </MDBTableHead>

                            <MDBTableBody>
                              {csvData.map((row, i) => (
                                <tr key={i} className={errors.find((e) => e.rowIndex === i) ? 'table-danger' : ''}>
                                  <td>{i + 1}</td>
                                  {displayHeaders.map((h) => (
                                    <td key={h} className={h === 'student_id' ? 'd-none' : ''}>
                                      {h === 'student_id' ? (
                                        <input type="hidden" value={row[h] || ''} />
                                      ) : h === 'full_name' ? (
                                        <input className="form-control" value={row[h] || ''} disabled />
                                      ) : h === 'payment_concept_id' ? (
                                        <select
                                          className="form-select"
                                          value={row[h] || ''}
                                          onChange={(e) => handleFieldChange(i, h, e.target.value)}
                                        >
                                          <option value="">{t('select')}</option>
                                          {paymentConcepts.map(pc => (
                                            <option key={pc.id} value={pc.id}>{pc.name}</option>
                                          ))}
                                        </select>
                                      ) : h === 'payment_through_id' ? (
                                        <select
                                          className="form-select"
                                          value={row[h] || ''}
                                          onChange={(e) => handleFieldChange(i, h, e.target.value)}
                                        >
                                          <option value="">{t('select')}</option>
                                          {paymentMethods.map(pm => (
                                            <option key={pm.id} value={pm.id}>{pm.name}</option>
                                          ))}
                                        </select>
                                      ) : h === 'payment_month' ? (
                                        <input
                                          className="form-control"
                                          type="month"
                                          value={row[h] || ''}
                                          onChange={(e) => handleFieldChange(i, h, e.target.value)}
                                        />
                                      ) : (
                                        <input
                                          className="form-control"
                                          value={row[h] || ''}
                                          onChange={(e) => handleFieldChange(i, h, e.target.value)}
                                        />
                                      )}
                                    </td>
                                  ))}

                                </tr>
                              ))}
                            </MDBTableBody>
                          </MDBTable>
                        </div>

                      {/* 5. Error messages */}
                      {(errors.length > 0 || validatingRows.size > 0) && (
                        <div className="mb-3">
                          <strong>{t('errors')}:</strong>
                          <ul>
                            {Array.from(validatingRows).map((idx) => (
                              <li key={`loading-${idx}`} className="text-warning">
                                {t('row')} {idx + 1}:{' '}
                                <span className="spinner-border spinner-border-sm me-2" role="status" />{' '}
                                {t('validating')}...
                              </li>
                            ))}
                            {errors.map((err) => (
                              <li key={err.rowIndex} className="text-danger">
                                {t('row')} {err.rowIndex + 1}: {err.messages.map((m) => t(m)).join('; ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 6. Upload Button */}
                      <MDBCol className='d-flex justify-content-end'>
                        <MDBBtn color="primary" className="btn-lg" onClick={handleUpload}>
                          {t('upload_valid_records')}
                        </MDBBtn>
                      </MDBCol>
                      
                    </>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </div>
      </section>
    </Layout>
  );
}
