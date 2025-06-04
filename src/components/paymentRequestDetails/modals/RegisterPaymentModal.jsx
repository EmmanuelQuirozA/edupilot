// src/components/PaymentRequestDetails/modals/RegisterPaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  MDBModal, MDBModalDialog, MDBModalContent,
  MDBModalHeader, MDBModalTitle, MDBModalBody,
  MDBModalFooter, MDBBtn, MDBRow, MDBCol, MDBIcon,
  MDBInput,
  MDBSpinner
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import useCatalog from '../../../hooks/useCatalogOptions';
import { formatDate } from '../../../utils/formatDate';
import swal from 'sweetalert';
import { createPayment } from '../../../api/paymentsApi';

export default function RegisterPaymentModal({ data, onClose, onSuccess }) {
  const { paymentRequest, student } = data;
  const { t, i18n } = useTranslation();

  // Controlled form state
  const [formData, setFormData] = useState({
    payment_month:      '',
    amount:             '',
    comments:           '',
    payment_through_id: '',
    payment_concept_id: ''
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Populate form with request defaults
  useEffect(() => {
    if (paymentRequest) {
      setFormData({
        payment_month:      paymentRequest.payment_month  || '',
        amount:             paymentRequest.amount         || '',
        comments:           paymentRequest.comments       || '',
        payment_through_id: paymentRequest.payment_through_id || '',
        payment_concept_id: paymentRequest.payment_concept_id || ''
      });
    }
  }, [paymentRequest]);

  // Load catalogs
  const {
    data: throughOptionsRaw,
    loading: loadThrough,
    fetchData: loadPaymentThrough
  } = useCatalog('paymentThrough');
  const {
    data: conceptOptionsRaw,
    loading: loadConcepts,
    fetchData: loadPaymentConcepts
  } = useCatalog('paymentConcepts');

  useEffect(() => {
    loadPaymentThrough();
    loadPaymentConcepts();
  }, []);

  // Dropzone config: accept pdf and images <=10MB
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { 'application/pdf': [], 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: accepted => {
      setFileError('');
      if (accepted.length) {
        setFile(accepted[0]);
      }
    }
  });

  // Handle file rejections
  useEffect(() => {
    if (fileRejections.length) {
      const err = fileRejections[0].errors[0];
      setFileError(err.message);
    }
  }, [fileRejections]);

  // derive options
  const throughOptions = (throughOptionsRaw || []).map(p => ({ value: p.id, label: p.name }));
  const conceptOptions = (conceptOptionsRaw || []).map(c => ({ value: c.id, label: c.name }));
  const isLoading = loadThrough || loadConcepts;

  // onChange builder
  const handleChange = key => e => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  // Submit handler using FormData
  const handleSave = async () => {
    // Trigger validation display
    setShowErrors(true);

    // Front-end required fields check
    const { amount, payment_through_id } = formData;
    if (!amount || !payment_through_id) return;
    if (fileError) return;

    const fd = new FormData();

    // wrap your JSON in a Blob so its part gets Content-Type: application/json
    const jsonPayload = {
      payment_request_id: paymentRequest.payment_request_id,
      student_id:         student.student_id,
      payment_month:      paymentRequest.payment_month,   // or formData.payment_month
      amount:             formData.amount,
      comments:           formData.comments,
      payment_through_id: formData.payment_through_id,
      payment_concept_id: formData.payment_concept_id
    };
    const blob = new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' });
    fd.append('request', blob);

    if (file) {
      fd.append('receipt', file);
    }

    setIsSaving(true);
    try {
      const res = await createPayment(fd, i18n.language);
      swal(res.title, res.message, res.type);
      if (res.success !== false) {
        onClose();
        onSuccess?.();
      }
    } catch (err) {
      swal(t('error'), t('unexpected_error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Form groups definition
  const registerPaymentFormGroups = [
    {
      groupTitle: 'payment',
      columns: 1,
      fields: [
        { key: 'amount',            label: 'amount',            type: 'number', required: true },
        { key: 'comments',          label: 'comments',          type: 'text'               },
        { key: 'payment_through_id',label: 'payment_method',    type: 'select', required: true, options: throughOptions }
      ]
    }
  ];

  return (
    <MDBModal open onClose={onClose}>
      <MDBModalDialog centered>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{t('register_payment')}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={onClose} />
          </MDBModalHeader>

          <MDBModalBody>
            {/* Read-only paymentRequest info */}
            <MDBRow>
              <h5>{t('payment_request')} #{paymentRequest.payment_request_id}</h5>
              {/* student info always read-only */}
              <MDBCol md="4"><small>{t('payment_month')}</small><p className="fw-bold">{(paymentRequest.payment_month ? formatDate(paymentRequest.payment_month, i18n.language, { year: 'numeric', month: 'long'}):t('not_available'))}</p></MDBCol>
              <MDBCol md="4"><small>{t('payment_concept')}</small><p className="fw-bold">{paymentRequest.pt_name}</p></MDBCol>
              <MDBCol md="4"><small>{t('partial_payment')}</small><p className="fw-bold">{paymentRequest.partial_payment_transformed}</p></MDBCol>
            </MDBRow>

            {isLoading && <p>{t('loading')}…</p>}
            {!isLoading && registerPaymentFormGroups.map(group => (
              <div key={group.groupTitle} className="my-2">
                <h5 className="mb-3">{t(group.groupTitle)}</h5>
                <div className={`row row-cols-1 row-cols-${group.columns} g-3`}>
                  {group.fields.map(field => (
                    <div key={field.key} className="col">
                      {field.type === 'select' ? (
                        <>
                        <label className="form-label">{t(field.label)}</label>
                        <select
                          className="form-select"
                          value={formData[field.key]}
                          onChange={handleChange(field.key)}
                        >
                          <option value="">— {t('select_option')} —</option>
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        </>
                      ) : (
                        <MDBInput
                          name={field.key}
                          label={t(field.label)}
                          type={field.type}
                          className="form-control"
                          value={formData[field.key]}
                          onChange={handleChange(field.key)}
                        />
                      )}
                      {field.required && showErrors && !formData[field.key] && (
                        <div className="text-danger small">{t('field_required')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Receipt upload */}
            <div className="mb-4">
              <h6>{t('attach_receipt')}</h6>
              <div
                {...getRootProps()}
                className={`border p-4 text-center ${isDragActive ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <input {...getInputProps()} />
                {file
                  ? <p><MDBIcon fas icon="file-upload-alt" className="me-2" />{file.name}</p>
                  : <p><MDBIcon fas icon="cloud-upload-alt" className="me-2" />{t('drag_drop_or_click_to_upload')}</p>
                }
              </div>
              {fileError && <div className="text-danger small mt-1">{fileError}</div>}
            </div>
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn outline color="secondary" onClick={onClose}>{isSaving ? <MDBSpinner size="sm" /> : t('cancel')}</MDBBtn>
            <MDBBtn type="button" onClick={handleSave} disabled={isSaving}> {isSaving ? <MDBSpinner size="sm" /> : t('submit')}</MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}