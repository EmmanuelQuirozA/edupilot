// src/components/paymentDetails/Header
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MDBCol, MDBIcon, MDBBtn } from 'mdb-react-ui-kit';
import swal from 'sweetalert';
import { updatePaymentStatus } from '../../api/paymentsApi';

export default function PaymentHeader({
  data,
  onPrint,
  canClose,
  canPrint, 
  onSuccess
}) {
  const { t, i18n } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  // Call backend to update status
  const handleUpdateStatus = async (newStatus) => {
    setIsSaving(true);
    try {
      const res = await updatePaymentStatus(
        data.payment_id,
        newStatus,
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
      title:    newStatus === 3 ? t('confirm_approve_payment')  : t('confirm_reject_payment'),
      text:     newStatus === 3 ? t('are_you_sure_approve_payment') : t('are_you_sure_reject_payment'),
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
          {t('payment')} #{data.payment_id}
        </h5>
      </div>

      <MDBCol className="d-none d-md-flex justify-content-end gap-2">
        {canPrint && (
          <MDBBtn size="sm" color="light" rippleColor="dark" onClick={onPrint}>
            <MDBIcon fas icon="print" className="me-1" /> {t('print')}
          </MDBBtn>
        )}

        {canClose && data.payment_status_id !== 3 && data.payment_status_id !== 4 && (
          <>
            <MDBBtn
              className="btn btn-sm btn-success"
              type="button"
              onClick={() => confirmStatusChange(3)}
              disabled={isSaving}
            >
              <MDBIcon fas icon="check" className="me-1" /> {t('approve')}
            </MDBBtn>

            <MDBBtn
              className="btn btn-sm btn-danger"
              type="button"
              onClick={() => confirmStatusChange(4)}
              disabled={isSaving}
            >
              <MDBIcon fas icon="times" className="me-1" /> {t('reject')}
            </MDBBtn>
          </>
        )}
      </MDBCol>
    </div>
  );
}
