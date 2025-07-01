import React, { useEffect, useRef, useState } from 'react';
import { MDBBtn, MDBCard, MDBCardBody, MDBInput, MDBTable, MDBTableHead, MDBTableBody, MDBCol, MDBRow } from 'mdb-react-ui-kit';
import Papa from 'papaparse';
import swal from 'sweetalert';
import axios from 'axios';
import Layout from '../layout/Layout';
import { getClassesCatalog } from '../api/classesApi';
import { getSchools } from '../api/schoolsApi';
import { useTranslation } from 'react-i18next';
import api from '../api/api';

export default function BulkStudentUpload() {
  const { t,i18n } = useTranslation();
  const [csvData, setCsvData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [validatingRows, setValidatingRows] = useState(new Set());
  const validationTimeouts = useRef({});
  
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
    'personal_email', 'email', 'username', 'password', 'register_id', 'payment_reference', 'group_id'
  ];

  const handleFieldChange = async (index, field, value) => {
    setCsvData(data => {
      const updated = [...data];
      updated[index] = { ...updated[index], [field]: value };
      // validateRow(updated[index], index); // Trigger row validation
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
        const classResp = await api.get(`http://localhost:8080/api/classes`, {
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
      const checkRes = await api.get(`http://localhost:8080/api/students/validate-exist`, {
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
            const checkRes = await api.get(`http://localhost:8080/api/students/validate-exist`, {
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
            const classResp = await api.get(`http://localhost:8080/api/classes`, {
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

        setCsvData(validatedData);
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
      ...row,
      school_id: formData.school_id || '',  // inject school_id from formData
    }));

    if (!validRows.length) return swal('Error', t('no_valid_records_to_upload'), 'warning');

    try {
      const res = await api.post('http://localhost:8080/api/students/create?lang=en', validRows);

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
      <MDBCard className="p-4">
        <MDBCardBody>
          <MDBRow>
            <MDBCol size="6" className='pb-2'>
              <h4>{t('bulk_student_upload')}</h4>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </MDBCol>
            <MDBCol size="6">
            </MDBCol>
          </MDBRow>
          <MDBCol size="6">
            <label htmlFor="schoolSelect">
              {t('school')}
            </label>
            <select
              id="schoolSelect"
              className="form-select"
              value={formData.school_id}
              onChange={e =>
                handleChange('school_id', e.target.value)
              }
              // disabled={isSaving}
              required
            >
              {schools.map(school => (
                <option key={school.id} value={school.school_id}>
                  {school.description}
                </option>
              ))}
            </select>
          </MDBCol>
          {csvData.length > 0 && (
            <>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <MDBTable responsive  className="mt-4 h-50" >
                  <MDBTableHead>
                    <tr>
                      {displayHeaders.map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {csvData.map((row, i) => (
                      <tr key={i} className={errors.find(e => e.rowIndex === i) ? 'table-danger' : ''}>
                        {displayHeaders.map(h => (
                          <td key={h}>
                            {h === 'group_id' ? (
                              <select
                                value={row[h] || ''}
                                onChange={(e) => handleFieldChange(i, h, e.target.value)}
                              >
                                <option value="">Seleccione una clase</option>
                                
                                {classes.map(cls => (
                                  <option key={cls.group_id} value={cls.group_id}>
                                    {cls.grade_group} ({cls.scholar_level_name})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                value={row[h] || ''}
                                onChange={(e) => handleFieldChange(i, h, e.target.value)}
                                style={{ border: 'none', background: 'transparent', width: '100%' }}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </MDBTableBody>
                </MDBTable>
              </div>
              {(errors.length > 0 || validatingRows.size > 0) && (
                <div className="mb-3">
                  <strong>Errores:</strong>
                  <ul>
                    {Array.from(validatingRows).map(idx => (
                      <li key={`loading-${idx}`} className="text-warning">
                        {t('row')} {idx + 1}: <span className="spinner-border spinner-border-sm me-2" role="status" /> Validando...
                      </li>
                    ))}
                    {errors.map(err => (
                      <li key={err.rowIndex} className="text-danger">
                        {t('row')} {err.rowIndex + 1}: {err.messages.map(m => t(m)).join('; ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <MDBBtn color="success" onClick={handleUpload}>Subir registros válidos</MDBBtn>
            </>
          )}
        </MDBCardBody>
      </MDBCard>
    </Layout>
  );
}
