// src/components/paymentRequestDetails/Header
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MDBCol, MDBIcon, MDBBtn } from 'mdb-react-ui-kit';
import swal from 'sweetalert';
import { updatePaymentRequest } from '../../api/paymentRequestsApi';

export default function RequestHeader({
  data,
  onPrintRequest,
  onEditRequest,
  onRegisterPayment,
  canUpdateRequest,
  canRegisterPayment,
  canCloseRequest,
  canPrint, 
  onSuccess
}) {
  const { t, i18n } = useTranslation();
  const { paymentRequest } = data;
  const [isSaving, setIsSaving] = useState(false);

  // Call backend to update status
  const handleUpdateStatus = async (newStatus) => {
    setIsSaving(true);
    try {
      const res = await updatePaymentRequest(
        paymentRequest.payment_request_id,
        { payment_status_id: newStatus, log_type_id: 1 },
        i18n.language
      );
      swal(res.title, res.message, res.type);
      if (res.success !== false) {
        onSuccess?.();
      }
    } catch (err) {
      swal(t('error'), t('unexpected_error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm dialog for status changes
  const confirmStatusChange = (newStatus) => {
    swal({
      title:    newStatus === 7 ? t('confirm_close_request')  : t('confirm_cancel_request'),
      text:     newStatus === 7 ? t('are_you_sure_close_request') : t('are_you_sure_cancel_request'),
      icon:     'warning',
      buttons:  [t('no'), t('yes')],
      dangerMode:true,
    }).then(willDo => {
      if (willDo) {
        handleUpdateStatus(newStatus);
      }
    });
  };

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <MDBIcon fas icon="receipt" className="me-2" />
        <h5 className="mb-0">
          {t('payment_request')} #{paymentRequest.payment_request_id}
        </h5>
      </div>

      <MDBCol className="d-none d-md-flex justify-content-end gap-2">
        {canPrint && (
          <MDBBtn flat size="sm" color="light" rippleColor="dark" onClick={onPrintRequest}>
            <MDBIcon fas icon="print" className="me-1" /> {t('print')}
          </MDBBtn>
        )}

        {canUpdateRequest && paymentRequest.payment_status_id !== 7 && paymentRequest.payment_status_id !== 8 && (
          <MDBBtn flat size="sm" onClick={() => onEditRequest(data)}>
            <MDBIcon fas icon="pen" />
          </MDBBtn>
        )}

        {canRegisterPayment && paymentRequest.payment_status_id !== 7 && paymentRequest.payment_status_id !== 8 && (
          <MDBBtn flat size="sm" onClick={() => onRegisterPayment(data)}>
            <MDBIcon fas icon="hand-holding-usd" className="cursor-pointer" />
          </MDBBtn>
        )}

        {canCloseRequest && paymentRequest.payment_status_id !== 7 && paymentRequest.payment_status_id !== 8 && (
          <>
            <MDBBtn
              className="btn btn-sm btn-success"
              type="button"
              onClick={() => confirmStatusChange(7)}
              disabled={isSaving}
            >
              <MDBIcon fas icon="check" className="me-1" /> {t('close_request')}
            </MDBBtn>

            <MDBBtn
              className="btn btn-sm btn-danger"
              type="button"
              onClick={() => confirmStatusChange(8)}
              disabled={isSaving}
            >
              <MDBIcon fas icon="times" className="me-1" /> {t('cancel')}
            </MDBBtn>
          </>
        )}
      </MDBCol>
    </div>
  );
}
