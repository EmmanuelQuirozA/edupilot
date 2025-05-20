// src/components/modals/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation }              from 'react-i18next';
import swal                            from 'sweetalert';
import { getPaymentDetail } from '../../api/studentApi';
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBIcon,
  MDBRow,
  MDBCol,
  MDBSpinner
} from 'mdb-react-ui-kit';

export default function PaymentModal({
  paymentId,
  show,
  setShow,
}) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(false)

  const [receiptPath, setReceiptPath] = useState(formData?.receipt_path);
  const [receiptName, setReceiptName] = useState(formData?.receipt_file_name);


  // fetch payment detail when modal opens
  useEffect(() => {
    if (!paymentId || !show) return
    setLoading(true)
    Promise.all([]).then(() => {
      return getPaymentDetail(paymentId, i18n.language)
    }).then(({ content }) => {
      setFormData(content[0] || null)
    }).catch(() => {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }).finally(() => setLoading(false))
  }, [paymentId, show, i18n.language, t])
    
  // when formData initially loads, seed these:
  useEffect(() => {
    if (formData) {
      setReceiptPath(formData.receipt_path);
      setReceiptName(formData.receipt_file_name);
    }
  }, [formData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ });

  if (!show) return null
  if (loading && !formData) return <p className="text-center">{t('loading')}…</p>
  if (!formData) return <p className="text-center text-danger">{t('not_available')}</p>
  
  // helper to render one field
  function renderInfoField({ labelKey, value, fmtOptions, prepend = '' }) {
    // optionally format dates
    const display =
      fmtOptions && value
        ? fmtDate(value, fmtOptions)
        : prepend
          ? prepend + value
          : value ?? t('not_available');

    return (
      <MDBCol md="4" sm="6" key={labelKey}>
        <small className="text-muted">{t(labelKey)}</small>
        <p className="fw-bold mb-0">{display}</p>
      </MDBCol>
    );
  }

  const fmtDate = (dateStr, options) =>
    dateStr
      ? new Intl.DateTimeFormat(t('locale'), options).format(new Date(dateStr))
      : t('not_available');

  return (
    <MDBModal open={show} setShow={() => setShow(false)} tabIndex="-1">
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
              {renderInfoField({ labelKey: 'full_name', value: formData.student_full_name })}
              {renderInfoField({ labelKey: 'payment_reference', value: formData.payment_reference })}
              {renderInfoField({ labelKey: 'generation', value: formData.generation })}
              {renderInfoField({ labelKey: 'grade_group', value: formData.grade_group })}
              {renderInfoField({ labelKey: 'scholar_level_name', value: formData.scholar_level_name })}
            </MDBRow>
            <MDBRow>
              <h5>{t("contact_and_address")}</h5>
              {renderInfoField({ labelKey: 'address', value: formData.address })}
              {renderInfoField({ labelKey: 'phone_number', value: formData.phone_number })}
              {renderInfoField({ labelKey: 'email', value: formData.email })}
            </MDBRow>
            <hr/>
            <MDBRow>
              <h5>{t("validation_details")}</h5>
              {renderInfoField({ labelKey: 'validator_full_name', value: formData.validator_full_name })}
              {renderInfoField({ labelKey: 'validator_phone_number', value: formData.validator_phone_number })}
              {renderInfoField({ labelKey: 'validated_at', value: formData.validated_at, fmtOptions: { year: 'numeric', month: 'long', day: '2-digit' } })}
            </MDBRow>
            <MDBRow>
              {/* editable selects */}
              <h5>{t("payment_details")}</h5>
              {renderInfoField({ labelKey: 'payt_name', value: formData.payt_name })}
              {renderInfoField({ labelKey: 'pt_name', value: formData.pt_name })}
              {renderInfoField({ labelKey: 'payment_status_name', value: formData.payment_status_name })}
            </MDBRow>
            <MDBRow>
              {renderInfoField({ labelKey: 'payment_created_at', value: formData.payment_created_at })}
              {renderInfoField({ labelKey: 'payment_month', value: formData.payment_month })}
              {renderInfoField({ labelKey: 'amount', value: formData.amount })}
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
                  {  receiptPath
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
    </MDBModal>
  )
}
