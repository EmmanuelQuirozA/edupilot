// src/components/PaymentRequestDetails/modals/UpdateRequestModal.jsx
import React, { useEffect, useState } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent,
  MDBModalHeader, MDBModalTitle, MDBModalBody,
  MDBModalFooter, MDBBtn, MDBInput, MDBCol,
  MDBRow,
  MDBSpinner
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
    payment_status_id: '',
    late_fee: '',
    fee_type: '',
    late_fee_frequency: '',
    payment_month: '',
    partial_payment: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reset when request changes
  useEffect(() => {
    if (paymentRequest) {
      setFormData({
        pr_amount:     paymentRequest.pr_amount ?? paymentRequest.amount ?? '',
        pr_pay_by:     paymentRequest.pr_pay_by ?? paymentRequest.pay_by ?? '',
        pr_comments:   paymentRequest.pr_comments ?? paymentRequest.comments ?? '',
        payment_month: paymentRequest.payment_month ?? ''
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
      amount:        formData.pr_amount,
      pay_by:        formData.pr_pay_by,
      comments:      formData.pr_comments,
      payment_month: formData.payment_month,
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

  // Define form groups
  const updatePaymentRequestFormGroups = [
    {
      columns: 1,
      fields: [{ key: 'pr_amount', label: 'amount', type: 'number' }]
    },
    {
      columns: 1,
      fields: [
        { key: 'pr_pay_by', label: 'pay_by', type: 'datetime-local' },
        { key: 'pr_comments', label: 'comments', type: 'text' },
        { key: 'payment_month', label: 'payment_month', type: 'month' }
      ]
    }
  ];

  return (
    <MDBModal open onClose={onClose}>
      <MDBModalDialog centered>
        <MDBModalContent>

          <MDBModalHeader>
            <MDBModalTitle>{t('update_payment_request')}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={onClose}/>
          </MDBModalHeader>

          <MDBModalBody>
            {updatePaymentRequestFormGroups.map((group, gi) => (
              <div key={gi} className="mb-4">
                {group.groupTitle && <h6 className="mb-3">{t(group.groupTitle)}</h6>}
                <MDBRow className={`row-cols-${group.columns} g-3`}>
                  {group.fields.map(field => (
                    <MDBCol key={field.key}>
                      <MDBInput
                        name={field.key}
                        label={t(field.label)}
                        type={field.type}
                        className="form-control"
                        value={formData[field.key]}
                        onChange={handleChange(field.key)}
                      />
                    </MDBCol>
                  ))}
                </MDBRow>
              </div>
            ))}
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn outline color="secondary" onClick={onClose}>
              {isSaving ? <MDBSpinner size="sm" /> : t('cancel')}
            </MDBBtn>
            <MDBBtn onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? <MDBSpinner size="sm" /> : t('update')}
            </MDBBtn>
          </MDBModalFooter>

        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}