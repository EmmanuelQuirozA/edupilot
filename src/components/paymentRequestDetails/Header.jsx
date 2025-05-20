// src/components/paymentRequestDetails/Header
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { MDBCol, MDBIcon, MDBBtn } from 'mdb-react-ui-kit';

export default function RequestHeader({
  data,
  onEditRequest,
  onRegisterPayment,
  onApprove,
  onReject,
}) {
  const { t } = useTranslation();
  const printRef = useRef();
  const { paymentRequest } = data;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `PaymentRequest-${paymentRequest.payment_request_id}`,
  });

  return (
    <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <MDBIcon fas icon="receipt" className="me-2" />
        <h5 className="mb-0">
          {t('payment_request')} #{paymentRequest.payment_request_id}
        </h5>
        </div>

        <MDBCol className="d-none d-md-flex justify-content-end gap-2">
          <MDBBtn
            flat
            size="sm" 
            color="light"
            rippleColor="dark"
            onClick={handlePrint}
          >
            <MDBIcon fas icon="print" className="me-1" /> {t('print')}
          </MDBBtn>
          
          {/* now fire the callbacks you got from your parent */}
          <MDBBtn flat size="sm" onClick={() => onEditRequest(data)}>
            <MDBIcon fas icon="pen" />
          </MDBBtn>
          
          <MDBBtn flat size="sm" onClick={() => onRegisterPayment(data)}>
            <MDBIcon fas icon="hand-holding-usd" className="cursor-pointer" />
          </MDBBtn>
        </MDBCol>

      <div>
        {onApprove && (
          <button
            className="btn btn-sm btn-success me-2"
            onClick={() => onApprove(paymentRequest)}
          >
            <MDBIcon fas icon="check" className="me-1" />
            {t('approve')}
          </button>
        )}
        {onReject && (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onReject(paymentRequest)}
          >
            <MDBIcon fas icon="times" className="me-1" />
            {t('reject')}
          </button>
        )}
      </div>
    </div>
  );
}
