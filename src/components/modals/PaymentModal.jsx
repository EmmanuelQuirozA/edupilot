// src/components/modals/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation }              from 'react-i18next';
import { formatDate } from '../../utils/formatDate';
import ProtectedFileModal from './ProtectedFileModal';
import { Link } from 'react-router-dom'
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter, MDBBtn, MDBIcon, MDBRow, MDBCol, MDBSpinner
} from 'mdb-react-ui-kit';
import usePaymentDetails from '../../hooks/usePaymentDetails';

export default function PaymentModal({paymentId, show,setShow,}) {
  const { t, i18n } = useTranslation()

  // Fetch payment
  const { data, loading, error, reload } = usePaymentDetails(paymentId);

  const [receiptPath, setReceiptPath] = useState(data?.receipt_path);
  const [receiptName, setReceiptName] = useState(data?.receipt_file_name);

  const [showFileModal, setShowFileModal] = useState(false);
  const [modalFilename, setModalFilename] = useState('');
  const [modalFilepath, setModalFilepath] = useState('');

  // when data initially loads, seed these:
  useEffect(() => {
    if (data) {
      setReceiptPath(data.receipt_path);
      setReceiptName(data.receipt_file_name);
    }
  }, [data]);


  if (!show) return null
  if (loading && !data) return <p className="text-center">{t('loading')}…</p>
  if (!data) return <p className="text-center text-danger">{t('not_available')}</p>
  
  // helper to render one field
  function renderInfoField({ labelKey, value, fmtOptions, prepend = '' }) {
    // optionally format dates
    const display =
      fmtOptions && value
        ? formatDate(value, i18n.language, fmtOptions)
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

  return (
    <MDBModal open={show} onClose={() => setShow(false)}>
      <MDBModalDialog size="xl">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{t('payment_details')} #{paymentId} </MDBModalTitle>
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
              {renderInfoField({ labelKey: 'full_name', value: data.student_full_name })}
              {renderInfoField({ labelKey: 'payment_reference', value: data.payment_reference })}
              {renderInfoField({ labelKey: 'grade_group', value: data.grade_group })}
              {/* {renderInfoField({ labelKey: 'generation', value: data.generation })}
              {renderInfoField({ labelKey: 'grade_group', value: data.grade_group })}
              {renderInfoField({ labelKey: 'scholar_level_name', value: data.scholar_level_name })} */}
            </MDBRow>
            {/* <MDBRow>
              <h5>{t("contact_and_address")}</h5>
              {renderInfoField({ labelKey: 'address', value: data.address })}
              {renderInfoField({ labelKey: 'phone_number', value: data.phone_number })}
              {renderInfoField({ labelKey: 'email', value: data.email })}
            </MDBRow> */}
            <hr/>
            <MDBRow>
              <h5>{t("validation_details")}</h5>
              {renderInfoField({ labelKey: 'validator_full_name', value: data.validator_full_name })}
              {renderInfoField({ labelKey: 'validator_phone_number', value: data.validator_phone_number })}
              {renderInfoField({ labelKey: 'validated_at', value: data.validated_at, fmtOptions: { year: 'numeric', month: 'long', day: '2-digit' } })}
            </MDBRow>
            <hr/>
            <MDBRow>
              <h5>{t("payment_details")}</h5>
              {renderInfoField({ labelKey: 'payment_type', value: data.payt_name })}
              {renderInfoField({ labelKey: 'payment_concept', value: data.pt_name })}
              {renderInfoField({ labelKey: 'payment_status_name', value: data.payment_status_name })}
            </MDBRow>
            <MDBRow>
              {renderInfoField({ labelKey: 'payment_created_at', value: data.payment_created_at, fmtOptions: {year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'} })}
              {renderInfoField({ labelKey: 'payment_month', value: data.payment_month, fmtOptions: { year: 'numeric', month: 'long'} })}
              {renderInfoField({ labelKey: 'amount', value: data.amount })}
            </MDBRow>
            
            { receiptPath && (
              <>
                <hr/>
                <MDBRow className="my-3">
                  <h5>{t('payment_receipt')}</h5>
                  {/* 2) Change the <a> to open the modal instead of default link */}
                  <MDBCol md="12" className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setModalFilename(receiptName);
                        setModalFilepath(receiptPath);
                        setShowFileModal(true);
                      }}
                      className="d-block btn btn-link p-0"
                      style={{ textDecoration: 'none' }}
                    >
                      <MDBIcon fas icon="file-invoice" className="me-2" />
                      {receiptName}
                    </button>
                  </MDBCol>
                </MDBRow>
              </>
            )}
          </MDBModalBody>
          
          <ProtectedFileModal
            filename={modalFilename}
            filepath={modalFilepath}
            show={showFileModal}
            onClose={() => setShowFileModal(false)}
            lang={i18n.language}
          />

          <MDBModalFooter>
            <Link
              to={`/paymentreports/paymentdetails/${paymentId}`}
              style={{ textDecoration: 'none' }}
            >
              <MDBBtn color="info">
                {t('go_to_details')}
              </MDBBtn>
            </Link>
            <MDBBtn
              type="button"
              color="secondary"
              onClick={() => setShow(false)}
              disabled={loading}
            >
              {loading ? <MDBSpinner size="sm" /> : t('close')}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  )
}
