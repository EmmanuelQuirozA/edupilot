// src/components/PaymentRequestDetails/modals/UpdateRequestModal.jsx
import React, { useEffect, useState } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent,
  MDBModalHeader, MDBModalTitle, MDBModalBody,
  MDBModalFooter, MDBBtn, MDBCol, MDBInput
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import { updatePaymentRequest } from '../../../api/studentApi';

export default function UpdateRequestModal({ data, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const { paymentRequest } = data;
  const [formData, setFormData] = useState({
    pr_amount: '',
    pr_pay_by: '',
    pr_comments: '',
    payment_month: '',
    payment_status_id: '',
    late_fee: '',
    fee_type: '',
    late_fee_frequency: '',
    partial_payment: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reset when request changes
  useEffect(() => {
    if (paymentRequest) {
      setFormData({
        late_fee: paymentRequest?.late_fee || '',
        fee_type: paymentRequest?.fee_type || '%',
        late_fee_frequency: paymentRequest?.late_fee_frequency || '',
        partial_payment: paymentRequest?.partial_payment || ''
      });
    }
  }, [paymentRequest]);

  const handleChange = (key) => (e) => {
    const value = e.target.type === 'checkbox'
      ? e.target.checked
      : e.target.value;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const payload = {
      late_fee: formData.late_fee,
      fee_type: formData.fee_type,
      late_fee_frequency: formData.late_fee_frequency,
      partial_payment: formData.partial_payment === 'true' || formData.partial_payment === true,
      log_type_id:   1
    };

    try {
      const res = await updatePaymentRequest(
        paymentRequest.payment_request_id,
        payload,
        i18n.language
      );
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

  return (
    <MDBModal open onClose={onClose}>
      <MDBModalDialog centered>
        <MDBModalContent>

          <MDBModalHeader>
            <MDBModalTitle>{t('update_payment_request')}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={onClose}/>
          </MDBModalHeader>

          <MDBModalBody>
            <MDBCol key={'fee_amount'}>
              <div className="input-group mb-3">
                <MDBInput
                  name="late_fee"
                  label={t('fee_amount')}
                  type="number"
                  value={formData.late_fee}
                  onChange={handleChange('late_fee')}
                  required
                  className="form-control"
                />
                <select
                  name="fee_type"
                  className="form-select"
                  style={{ minWidth: '62px' }}
                  value={formData.fee_type}
                  onChange={handleChange('fee_type')}
                >
                  <option value="$">$</option>
                  <option value="%">%</option>
                </select>
              </div>
              <div className="input-group mb-3">
                <MDBInput
                  name="late_fee_frequency"
                  label={t('late_fee_frequency')}
                  type="number"
                  value={formData.late_fee_frequency}
                  onChange={handleChange('late_fee_frequency')}
                  required
                  className="form-control"
                  min={0}
                />
              </div>
              <div className="input-group mb-3">
                <select
                  name="partial_payment"
                  className="form-select"
                  style={{ minWidth: '62px' }}
                  value={formData.partial_payment}
                  onChange={handleChange('partial_payment')}
                >
                  <option value={false}>{t('no')}</option>
                  <option value={true}>{t('yes')}</option>
                </select>
              </div>
            </MDBCol>
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn outline color="secondary" onClick={onClose}>
              {t('cancel')}
            </MDBBtn>
            <MDBBtn onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? t('saving') + '…' : t('update')}
            </MDBBtn>
          </MDBModalFooter>

        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}