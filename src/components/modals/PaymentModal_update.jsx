// src/components/modals/PaymentModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation }              from 'react-i18next';
import swal                            from 'sweetalert';
import { getPaymentDetail, updatePayment } from '../../api/studentApi';
import useCatalog from '../../hooks/useCatalogOptions';
import { uploadReceipt } from '../../api/studentApi';
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBValidation,
  MDBValidationItem,
  MDBInput,
  MDBRow,
  MDBCol,
  MDBSpinner,
  MDBIcon
} from 'mdb-react-ui-kit';

export default function PaymentModal({
  paymentId,
  show,
  setShow,
  canUpdate,     // boolean: if true, we allow editing
  onUpdated,     // callback once an update succeeds
  idPrefix = '',
  isSaving = false
}) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [validated, setValidated] = useState(false);


  const [uploading, setUploading] = useState(false);
  const [receiptPath, setReceiptPath] = useState(formData?.receipt_path);
  const [receiptName, setReceiptName] = useState(formData?.receipt_file_name);

  // Fetch catalogs
  const { data: paymentConcepts, fetchData: loadPaymentConcepts } = useCatalog('paymentConcepts');
  const { data: paymentThrough, fetchData: loadPaymentThrough } = useCatalog('paymentThrough');
  const { data: paymentStatuses, fetchData: loadPaymentStatuses } = useCatalog('paymentStatuses');
  
  // editable keys
  const editableKeys = [
    'payment_concept_id',
    'payment_month',
    'amount',
    'payment_status_id',
    'validated_at',
    'payment_created_at',
    'payment_request_id',
    'payment_through_id'
  ];

  // fetch payment detail when modal opens
  useEffect(() => {
    if (!paymentId || !show) return
    setLoading(true)
    Promise.all([
      loadPaymentConcepts(),
      loadPaymentThrough(),
      loadPaymentStatuses()
    ]).then(() => {
      return getPaymentDetail(paymentId, i18n.language)
    }).then(({ content }) => {
      setFormData(content[0] || null)
    }).catch(() => {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }).finally(() => setLoading(false))
  }, [paymentId, show, i18n.language, t])

  const API_KEY = {
    payment_created_at: 'created_at',
    payment_concept_id: 'payment_concept_id',
    payment_month: 'payment_month',
    amount: 'amount',
    payment_status_id: 'payment_status_id',
    validated_at: 'validated_at',
    comments: 'comments',
    payment_request_id: 'payment_request_id',
    payment_through_id: 'payment_through_id'
  };

    
  // when formData initially loads, seed these:
  useEffect(() => {
    if (formData) {
      setReceiptPath(formData.receipt_path);
      setReceiptName(formData.receipt_file_name);
    }
  }, [formData]);

  const onDrop = useCallback(async files => {
    if (!files.length) return;
    const file = files[0];
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('paymentReference', formData.payment_reference);
      const response = await uploadReceipt(paymentId,form,i18n.language);
      // assume { receiptPath, receiptFileName } returned
      setReceiptPath(response.data.receiptPath);
      setReceiptName(response.data.receiptFileName);
      // merge into our formData so updatePayment will include it
      setFormData(f => ({
        ...f,
        receipt_path: response.data.receiptPath,
        receipt_file_name: response.data.receiptFileName
      }));
      swal(t('success'), t('receipt_uploaded'), 'success');
    } catch {
      swal(t('error'), t('failed_to_upload_receipt'), 'error');
    } finally {
      setUploading(false);
    }
  }, [paymentId, formData, i18n.language, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });


  async function handleSubmit(e) {
    e.preventDefault()
    setValidated(true)
    if (!e.target.checkValidity()) return

    // build a lean payload
    const payload = editableKeys.reduce((obj, uiKey) => {
      const apiKey = API_KEY[uiKey] || uiKey;
      // only include it if the user actually loaded/chose something:
      if (formData[uiKey] !== undefined) {
        obj[apiKey] = formData[uiKey];
      }
      return obj;
    }, {});
    

    setLoading(true)
    try {
      await updatePayment(paymentId, payload, i18n.language)
      swal(t('success'), t('payment_updated'), 'success')
      setShow(false)
      onUpdated?.()
    } catch {
      swal(t('error'), t('failed_to_update_payment'), 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null
  if (loading && !formData) return <p className="text-center">{t('loading')}…</p>
  if (!formData) return <p className="text-center text-danger">{t('not_available')}</p>

  // helper to render one field
  const renderField = (key, label, colSize, type='text', required, options=[]) => {
    const value = formData[key]
    const isEditable = canUpdate && editableKeys.includes(key)

    if (isEditable) {
      if (type === 'select') {
        return (
          <MDBCol key={key} md={colSize} className="mb-3">
            <MDBValidationItem feedback={t(`${key}_required`)} invalid>
              <label htmlFor={key}>{t(label)}</label>
              <select
                id={key}
                className="form-select"
                value={value || ''}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                required={required}
              >
                <option value="" disabled>{t('select_option')}</option>
                  {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </MDBValidationItem>
          </MDBCol>
        )
      } else if (type === 'month') {
        return (
          <MDBCol key={key} md={colSize} className="mb-3">
            <MDBValidationItem feedback={t(`${key}_required`)} invalid>
              <MDBInput
                id={key}
                label={t(label)}
                type={type}
                value={value || ''}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                required={required}
              />
            </MDBValidationItem>
          </MDBCol>
        )
      } else if (type === 'amount') {
        return (
          <MDBCol key={key} md={colSize} className="mb-3">
            <MDBValidationItem feedback={t(`${key}_required`)} invalid>
              <div className="input-group">
                <span className="input-group-text"
                  style={{ paddingTop:"1.1rem", paddingBottom:"1.1rem"}}>$</span>
                <MDBInput
                  id={key}
                  className="form-control"
                  type="number"
                  value={formData[key] || ''}
                  onChange={e => setFormData({
                    ...formData,
                    [key]: e.target.value
                  })}
                  required={required}
                />
              </div>
            </MDBValidationItem>
          </MDBCol>
        )
      } else if (type === 'datetime-local') {
        return (
          <MDBCol key={key} md={colSize} className="mb-3">
            <MDBValidationItem feedback={t(`${key}_required`)} invalid>
              <MDBInput
                id={key}
                label={t(label)}
                type={type}
                value={value || ''}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                required={required}
              />
            </MDBValidationItem>
          </MDBCol>
        )
      } else {
        return (
          <MDBCol key={key} md={colSize} className="mb-3">
            <MDBValidationItem feedback={t(`${key}_required`)} invalid>
              <MDBInput
                id={key}
                label={t(label)}
                type={type}
                value={value || ''}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                required={required}
              />
            </MDBValidationItem>
          </MDBCol>
        )
      }
    }

    // read-only
    return (
      <MDBCol key={key} md={colSize} className="mb-3">
        <p className="mb-1 text-muted">{t(label)}</p>
        <strong>{(value === "" || value === null)  ? t('not_available') : String(value)}</strong>
      </MDBCol>
    )
  }

      return (
    <MDBModal open={show} setShow={() => setShow(false)} tabIndex="-1">
      {canUpdate ? (
        <MDBValidation onSubmit={handleSubmit} noValidate validated={validated}>
          <MDBModalDialog size="xl">
            <MDBModalContent>
              <MDBModalHeader>
                <MDBModalTitle>{t('edit_payment')}</MDBModalTitle>
                <MDBBtn
                  type="button"
                  className="btn-close"
                  color="none"
                  onClick={() => setShow(false)}
                />
              </MDBModalHeader>

              <MDBModalBody>
                <MDBRow>
                  <h5>{t("student")}</h5>
                  {/* student info always read-only */}
                  {renderField('student_full_name', 'full_name', 6)}
                  {renderField('payment_reference', 'payment_reference', 6)}
                  {renderField('generation', 'generation', 4)}
                  {renderField('grade_group', 'grade_group', 4)}
                  {renderField('scholar_level_name', 'scholar_level_name', 4)}
                </MDBRow>
                <MDBRow>
                  <h5>{t("contact_and_address")}</h5>
                  {renderField('address', 'address', 4)}
                  {renderField('phone_number', 'phone_number', 4)}
                  {renderField('email', 'email', 4)}
                </MDBRow>
                <hr/>
                <MDBRow>
                  <h5>{t("validation_details")}</h5>
                  {renderField('validator_full_name', 'validator_full_name', 4)}
                  {renderField('validator_phone_number', 'validator_phone_number', 4)}
                  {renderField('validated_at', 'validated_at', 4)}
                </MDBRow>
                <MDBRow>
                  {/* editable selects */}
                  <h5>{t("payment_details")}</h5>
                  {renderField('payment_through_id', 'payment_method', 4, 'select', true,
                    paymentThrough.map(p=>({ value: p.id, label: p.name })))
                  }
                  {renderField('payment_concept_id', 'payment_concept', 4, 'select', true,
                    paymentConcepts.map(p=>({ value: p.id, label: p.name })))
                  }
                  {renderField('payment_status_id', 'payment_status_name', 4,'select', true,
                    paymentStatuses.map(p=>({ value: p.id, label: p.name })))
                  }
                </MDBRow>
                <MDBRow>
                  {renderField('payment_created_at', 'payment_created_at', 4, 'datetime-local', true)}
                  {renderField('payment_month', 'payment_month', 4, 'month', false)}
                  {renderField('amount', 'amount', 4, 'amount', true)}
                </MDBRow>

                <MDBRow>
                  <h5>{t('upload_receipt')}</h5>
                  <MDBCol md="12" className="mb-3">
                    <div
                      {...getRootProps()}
                      className={`border p-4 text-center ${isDragActive ? 'bg-light' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input {...getInputProps()} />
                      {uploading
                        ? <p>{t('uploading')}…</p>
                        : receiptPath
                          ? <p>
                              <MDBIcon fas icon="file-invoice" className="me-2" />
                              <a href={receiptPath} target="_blank" rel="noopener noreferrer">
                                {receiptName}
                              </a>
                            </p>
                          : <p>
                              <MDBIcon fas icon="cloud-upload-alt" className="me-2" />
                              {t('drag_drop_or_click_to_upload')}
                            </p>
                      }
                    </div>
                  </MDBCol>
                </MDBRow>
              </MDBModalBody>

              <MDBModalFooter>
                <MDBBtn
                  type="button"
                  color="secondary"
                  onClick={() => setShow(false)}
                  disabled={loading}
                >
                  {loading ? <MDBSpinner size="sm" /> : t('close')}
                </MDBBtn>
                <MDBBtn type="submit" color="primary" disabled={loading}>
                  {loading ? <MDBSpinner size="sm" /> : t('save_changes')}
                </MDBBtn>
              </MDBModalFooter>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBValidation>
      ) : (
        <MDBModalDialog size="xl">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t('payment_details')}</MDBModalTitle>
              <MDBBtn
                type="button"
                className="btn-close"
                color="none"
                onClick={() => setShow(false)}
              />
            </MDBModalHeader>
            <MDBModalBody>
              <MDBRow>
                <h5>{t("student")}</h5>
                {renderField('student_full_name', 'full_name', 6, 'text')}
                {renderField('payment_reference', 'payment_reference', 6, 'text')}
                {renderField('generation', 'generation', 4, 'text')}
                {renderField('grade_group', 'grade_group', 4, 'text')}
                {renderField('scholar_level_name', 'scholar_level_name', 4, 'text')}
              </MDBRow>
              <MDBRow>
                <h5>{t("contact_and_address", 'text')}</h5>
                {renderField('address', 'address', 4, 'text')}
                {renderField('phone_number', 'phone_number', 4, 'text')}
                {renderField('email', 'email', 4, 'text')}
              </MDBRow>
              <hr/>
              <MDBRow>
                {renderField('payt_name', 'payment_method', 4, 'text')}
                {renderField('pt_name', 'payment_concept', 4, 'text')}
                {renderField('payment_status_name', 'payment_status_name', 4, 'text')}
              </MDBRow>
              <MDBRow>
                {renderField('payment_month', 'payment_month', 4, 'month')}
                {renderField('amount', 'amount', 4, 'amount')}
                {renderField('validator_full_name', 'validator_full_name', 4, 'text')}
              </MDBRow>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                type="button"
                color="secondary"
                onClick={() => setShow(false)}
              >
                {t('close')}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      )}
    </MDBModal>
  )
}
