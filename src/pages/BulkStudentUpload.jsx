import React, { useEffect, useRef, useState } from 'react';
import { MDBBtn, MDBCard, MDBCardBody,  MDBTable, MDBTableHead, MDBTableBody, MDBCol, MDBRow, MDBIcon } from 'mdb-react-ui-kit';
import Papa from 'papaparse';
import swal from 'sweetalert';
import Layout from '../layout/Layout';
import { getClassesCatalog } from '../api/classesApi';
import { getSchools } from '../api/schoolsApi';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import LoadingComponent from '../components/common/LoadingComponent'

export default function BulkStudentUpload() {
  const { t,i18n } = useTranslation();
  const [csvData, setCsvData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [validatingRows, setValidatingRows] = useState(new Set());
  const validationTimeouts = useRef({});

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const [formData, setFormData] = useState({ school_id: '' });

  const handleChange = (key, value) => {
    setFormData(fd => ({ ...fd, [key]: value }));

    if (key === 'school_id') {
      setCsvData(data => data.map(row => ({ ...row, school_id: value })));
    }
  };

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

  }, [i18n.language]);

  const debouncedValidateRow = (row, index) => {
    // Clear any existing timeout for this row
    clearTimeout(validationTimeouts.current[index]);

    setValidatingRows(prev => new Set(prev).add(index));

    // Set a new timeout for validation
    validationTimeouts.current[index] = setTimeout(async () => {
      await validateRow(row, index);
      setValidatingRows(prev => {
        const updated = new Set(prev);
        updated.delete(index);
        return updated;
      });
    }, 1500); // 1.5 seconds debounce
  };

  const requiredHeaders = [
    'first_name', 'last_name_father', 'last_name_mother', 'email', 'username', 'password', 'register_id', 'payment_reference', 'group_id'
  ];
  const displayHeaders = [
    'first_name', 'last_name_father', 'last_name_mother', 'birth_date', 'phone_number', 'tax_id', 'curp',
    'street', 'ext_number', 'int_number', 'suburb', 'locality', 'municipality', 'state',
    'personal_email', 'email', 'username', 'password', 'register_id', 'payment_reference', 'group_id', 'balance'
  ];

  const handleFieldChange = async (index, field, value) => {
    setCsvData(data => {
      const updated = [...data];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Debounce validation
    debouncedValidateRow(
      { ...csvData[index], [field]: value },
      index
    );

    // Special case for group_id to resolve it to group_id
    if (field === 'group_id') {
      try {
        const classResp = await api.get(`${baseUrl}/api/classes`, {
          params: {
            lang: 'en',
            grade_group: value
          }
        });
        const group = classResp.data.content?.[0];
        if (group) {
          setCsvData(prevData => {
            const updated = [...prevData];
            updated[index]['group_id'] = group.group_id;
            return updated;
          });
        } else {
          setErrors(prev => [...prev, {
            rowIndex: index,
            messages: ['invalid_class']
          }]);
        }
      } catch (err) {
        setErrors(prev => [...prev, {
          rowIndex: index,
          messages: ['error_validating_class']
        }]);
      }
    }
  };

  const validateRow = async (row, index) => {
    const rowErrors = [];

    // Required fields
    for (const field of requiredHeaders) {
      if (!row[field]) rowErrors.push(`${field} is required`);
    }

    // Check duplicates in CSV
    const regIdCount = csvData.filter((r, i) => r.register_id === row.register_id && i !== index).length;
    const payRefCount = csvData.filter((r, i) => r.payment_reference === row.payment_reference && i !== index).length;
    const payUnamCount = csvData.filter((r, i) => r.username === row.username && i !== index).length;
    if (regIdCount > 0) rowErrors.push('duplicate_registration_id_in_file');
    if (payRefCount > 0) rowErrors.push('duplicate_payment_reference_in_file');
    if (payUnamCount > 0) rowErrors.push('duplicate_username_in_file');

    // Check DB duplicates
    try {
      const checkRes = await api.get(`${baseUrl}/api/students/validate-exist`, {
        params: {
          register_id: row.register_id,
          payment_reference: row.payment_reference,
          username: row.username
        }
      });

      if (typeof checkRes.data === 'object') {
        if (checkRes.data[0].register_id === 1) rowErrors.push('registration_id_already_exists_in_DB');
        if (checkRes.data[0].payment_reference === 1) rowErrors.push('payment_reference_already_exists_in_DB');
        if (checkRes.data[0].username === 1) rowErrors.push('username_already_exists_in_DB');
      } else {
        rowErrors.push('unexpected_validation_response');
      }
    } catch {
      rowErrors.push('error_checking_database');
    }

    // Validate group_id (must match a known group_id)
    const classObj = classes.find(c => c.group_id === Number(row.group_id));
    if (!classObj) {
      rowErrors.push('invalid_class');
    }

    // Update the errors state
    setErrors(prev => {
      const newErrors = prev.filter(err => err.rowIndex !== index);
      if (rowErrors.length) {
        newErrors.push({ rowIndex: index, messages: rowErrors });
      }
      return newErrors;
    });
  };


  const handleFileUpload = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = results.data;
        const seenRegIds = new Set();
        const seenPayRefs = new Set();
        const seenUsername = new Set();
        const newErrors = [];

        const validatedData = await Promise.all(parsed.map(async (row, i) => {
          const rowErrors = [];

          // Check all required fields
          for (const field of requiredHeaders) {
            if (!row[field]) {
              rowErrors.push(`${field} is required`);
            }
          }

          // Check uniqueness within CSV
          if (seenRegIds.has(row.register_id)) rowErrors.push('duplicate_registration_id_in_file');
          if (seenPayRefs.has(row.payment_reference)) rowErrors.push('duplicate_payment_reference_in_file');
          if (seenUsername.has(row.username)) rowErrors.push('duplicate_username_in_file');
          seenRegIds.add(row.register_id);
          seenPayRefs.add(row.payment_reference);
          seenUsername.add(row.username);

          // Check uniqueness in DB
          try {
            const checkRes = await api.get(`${baseUrl}/api/students/validate-exist`, {
              params: {
                register_id: row.register_id,
                payment_reference: row.payment_reference,
                username: row.username
              }
            });

            if (typeof checkRes.data === 'object') {
              if (checkRes.data[0].register_id === 1) rowErrors.push('registration_id_already_exists_in_DB');
              if (checkRes.data[0].payment_reference === 1) rowErrors.push('payment_reference_already_exists_in_DB');
              if (checkRes.data[0].username === 1) rowErrors.push('username_already_exists_in_DB');
            } else {
              rowErrors.push('unexpected_validation_response');
            }
          } catch (err) {
            rowErrors.push('error_checking_database');
          }

          // Validate group_id and resolve group_id
          try {
            const classResp = await api.get(`${baseUrl}/api/classes`, {
              params: {
                lang: 'en',
                grade_group: row.group_id
              }
            });
            // const group = classResp.data.content?.[0];
            const group = classes.find(cls => cls.grade_group === row.group_id);
            if (group) {
              row.group_id = group.group_id;
            } else {
              rowErrors.push('invalid_class');
            }
          } catch (err) {
            rowErrors.push('error_validating_class');
          }

          if (rowErrors.length) {
            newErrors.push({ rowIndex: i, messages: rowErrors });
          }
          return row;
        }));

        setLoading(false);
        setCsvData(validatedData);
        setErrors(newErrors);
      },
      error: (err) => {
        setLoading(false);
        swal('Error', t('could_not_parse_csv'), 'error');
      }
    });
  };

  const handleUpload = async () => {
    const validRows = csvData.filter((_, i) => !errors.find(err => err.rowIndex === i))
    .map(row => ({
      ...row,
      school_id: formData.school_id || '',  // inject school_id from formData
    }));

    if (!validRows.length) return swal('Error', t('no_valid_records_to_upload'), 'warning');

    try {
      const res = await api.post(`${baseUrl}/api/students/create?lang=en`, validRows);

      swal(res.data.title, res.data.message, res.data.type);
      setCsvData([]);
      setErrors([]);
    } catch (err) {
      console.error(err);
      swal('Error', 'upload_failed', 'error');
    }
  };

  return (
    <Layout pageTitle={t('bulk_student_upload')}>
      <section className="home-section">
        <div className="content-wrapper">
          <MDBRow className="justify-content-center">
            <MDBCol lg="10" md="10">
              <MDBCard className="custom-card p-4 shadow-4">
                <MDBCardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">{t('bulk_student_upload')}</h4>
                  </div>

                  {/* 1. School Selector */}
                  <div className="mb-4">
                    <label htmlFor="schoolSelect" className="form-label fw-bold">
                      1. {t('select_school')}
                    </label>
                    <select
                      className="form-select"
                      id="schoolSelect"
                      value={formData.school_id}
                      onChange={(e) => handleChange('school_id', e.target.value)}
                      required
                    >
                      <option value="">{`— ${t('select_option')} —`}</option>
                      {schools.map((school) => (
                        <option key={school.school_id} value={school.school_id}>
                          {school.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Layout download */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">2. {t('download_layout')}</label>
                    <p className="text-muted">
                      {t('layout_instructions')}
                    </p>
                    <MDBBtn color="success" className="w-100" onClick={async () => {
                      try {
                        const response = await api.get('/api/bulkfile/students_bulk_upload.csv', {
                          responseType: 'blob' // Important to handle binary data
                        });

                        // Create a link to trigger the download
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'students_bulk_upload.csv'); // Set default filename
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

                  {/* 3. File upload */}
                  <div className="mb-4">
                    <label htmlFor="fileUploadInput" className="form-label fw-bold">
                      3. {t('upload_file')}
                    </label>
                    <div
                      className={loading ? 'border-2 border-secondary rounded drop-zone-box text-center p-4 bg-light drop-zone user-select-none':'border-2 border-secondary rounded drop-zone-box text-center p-4 bg-light drop-zone' }
                      style={{borderStyle:'dashed'}}
                      role={loading ? '':'button'}
                      onClick={() => document.getElementById('fileUploadInput').click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files.length > 0) handleFileUpload({ target: { files } });
                      }}
                    >
                      <div className={loading ? 'text-secondary drop-zone-icon mb-2':'text-primary drop-zone-icon mb-2'}>
                        <MDBIcon fas icon="cloud-upload-alt" size="2x" />
                      </div>
                      <span>{t('drag_or_click')}</span>
                      <p/>
                      <small className='text-muted'>{t('supported_files')}: .csv</small>
                      <input
                        disabled={loading}
                        type="file"
                        id="fileUploadInput"
                        className="d-none"
                        accept=".csv"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  {loading && (
                    <LoadingComponent />
                  )}

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
                                    minWidth:'200px'
                                  }}
                                />
                              ))}
                            </colgroup>

                            <MDBTableHead>
                              <tr>
                                <th>#</th>
                                {displayHeaders.map((h) => (
                                  <th key={h}>{h}</th>
                                ))}
                              </tr>
                            </MDBTableHead>

                            <MDBTableBody>
                              {csvData.map((row, i) => (
                                <tr key={i} className={errors.find((e) => e.rowIndex === i) ? 'table-danger' : ''}>
                                  <td>{i + 1}</td>
                                  {displayHeaders.map((h) => (
                                    <td key={h}>
                                      {h === 'group_id' ? (
                                        <select
                                          className="form-select"
                                          value={row[h] || ''}
                                          onChange={(e) => handleFieldChange(i, h, e.target.value)}
                                        >
                                          <option value="">{t('select_class')}</option>
                                          {classes.map((cls) => (
                                            <option key={cls.group_id} value={cls.group_id}>
                                              {cls.grade_group} ({cls.scholar_level_name})
                                            </option>
                                          ))}
                                        </select>
                                      ) : h === 'birth_date' ? (
                                        <input
                                          className="form-control"
                                          type="date"
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
