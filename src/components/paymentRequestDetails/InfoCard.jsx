import React, { useState } from 'react';
import { MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatDate';
import FormModal from '../../components/common/FormModal';
import { updatePaymentRequest } from '../../api/studentApi';
import swal from 'sweetalert';

export default function RequestHeader({ 
  data, 
  onApprove, 
  onReject 
}) {
  const { t, i18n } = useTranslation();
  const { paymentRequest, paymentInfo } = data;


  // New state to track the selected PR for mass students upload
  const [isSaving, setIsSaving] = useState(false);

  // Modal state for "Update request"
  const [isUpdateRequestModalOpen, setIsUpdateRequestModalOpen] = useState(false);
  const toggleUpdateRequestModal = () => setIsUpdateRequestModalOpen(v => !v);

  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState(null);

  
  // Update form groups (main fields)
  const updatePaymentRequestFormGroups = [
    {
      groupTitle: 'fee',
      columns: 1,
      fields: [
        { key: 'pr_amount', label: 'amount', type: 'number' },
      ],
    },
    {
      columns: 1,
      fields: [
        { key: 'pr_pay_by', label: 'pay_by', type: 'datetime-local' },
        { key: 'pr_comments', label: 'comments', type: 'text' },
        { key: 'payment_month', label: 'payment_month', type: 'month' },
      ],
    },
  ];


  function KeyValue({ label, type, value, icon: Icon }) {
    return (
      <MDBCol md="4">
        <p className="mb-0 text-muted">{t(label)}:</p>
        <strong>{
          value ? 
          (type==="dateTime" ? 
            formatDate(value, i18n) : value
          ) : t("not_available")}</strong>
      </MDBCol>
    );
  }
  

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
  
      const payload = {
        amount: selectedPaymentRequest.pr_amount,
        pay_by: selectedPaymentRequest.pr_pay_by,
        comments: selectedPaymentRequest.pr_comments,
        payment_status_id: selectedPaymentRequest.pr_payment_status_id,
        late_fee: selectedPaymentRequest.late_fee,
        fee_type: selectedPaymentRequest.fee_type,
        late_fee_frequency: selectedPaymentRequest.late_fee_frequency,
        payment_month: selectedPaymentRequest.payment_month,
        partial_payment: selectedPaymentRequest.partial_payment === 'true' || selectedPaymentRequest.partial_payment === true,
        log_type_id: 1,
      };
  
      await updatePaymentRequest(paymentRequest.payment_request_id, payload, i18n.language)
      .then((resData) => {
        swal(resData.title, resData.message, resData.type);

        if (resData.success !== false) {
          // setIsUpdateSettingsModalOpen(false); 
          setIsUpdateRequestModalOpen(false); 
          // detailsReload();
          // logsReload();
        }
      })
      .catch(() => {
        swal('Error', 'Unexpected error occurred while updating.', 'error');
      })
      .finally(() => {
        setIsSaving(false);
      });

    } catch (error) {
      console.error('Error updating settings:', error);
      setIsSaving(false);
    }
  };

  return (
    <>
    <div className='groupStyle'>
      <MDBRow className="d-flex justify-content-between align-items-center">
        <MDBCol>
          <h6 className="text-uppercase text-muted small ">{t('request_information')}</h6>
        </MDBCol>
        <MDBCol className="d-flex justify-content-end gap-2">
          <strong
            className={`px-2 py-1 rounded ${
              paymentRequest.pr_payment_status_id === 5
                ? "bg-success text-white"
                : "bg-warning text-white"
            }`}
            style={{ display: "inline-block" }}
          >
            <h5 className="text-white my-0">{paymentRequest.ps_pr_name}</h5>
          </strong>
        </MDBCol>
      </MDBRow>
      <MDBRow className='pb-4'>
        <KeyValue label={t("created_on")} type="dateTime" value={paymentRequest.pr_created_at}/>
        <KeyValue label={t("due_date")} type="dateTime" value={paymentRequest.pr_pay_by}/>
        <KeyValue label={t("payment_month")} type="month" value={formatDate(paymentRequest.payment_month, i18n.language, { year: 'numeric', month: 'long'})}/>
        <KeyValue label={t("periods_late")} type="text" value={paymentInfo.latePeriods}/>
        <KeyValue label={t("late_fee_per_period")} type="text" value={paymentRequest.fee_type+paymentRequest.late_fee.toFixed(2)}/>
        <KeyValue label={t("late_fee_total")} type="balance" value={"$"+paymentInfo.accumulatedFees.toFixed(2)}/>
        <KeyValue label={t("initial_amount")} type="text" value={"$"+paymentRequest.pr_amount.toFixed(2)}/>
        <KeyValue label={t("paid_to_date")} type="text" value={"$"+paymentInfo.totalPaid.toFixed(2)}/>
        <KeyValue label={t("amount_due_now")} type="balance" value={"$"+paymentInfo.pendingPayment.toFixed(2)}/>
        <KeyValue label={t("request_status")} type="text" value={paymentRequest.ps_pr_name}/>
        <KeyValue label={t("payment_concept")} type="text" value={paymentRequest.pt_name}/>
      </MDBRow>
    </div>

    {paymentRequest.pr_comments != null && (
      <div className='groupStyle'>
        <div className="mb-4">
          <h6 className="text-uppercase text-muted small">{t('comments')}</h6>
          <p className="fst-italic">{paymentRequest.pr_comments || t('not_available')}</p>
        </div>
      </div>
    )}

    <FormModal
      open={isUpdateRequestModalOpen}
      onClose={toggleUpdateRequestModal}
      formGroups={updatePaymentRequestFormGroups}
      data={selectedPaymentRequest}
      setData={setSelectedPaymentRequest}
      onSave={handleUpdate}
      title={t('update_payment_request')}
      size="m"
      idPrefix="updateRequest_"
      isSaving={isSaving}
    />
    </>
  );
}
