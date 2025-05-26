import React from 'react';
import { MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatDate';

export default function RequestHeader({ data }) {
  const { t, i18n } = useTranslation();
  const { paymentRequest, paymentInfo } = data;
  function KeyValue({ label, type, value, icon: Icon }) {
    return (
      <MDBCol md="4">
        <p className="mb-0 text-muted">{t(label)}:</p>
        <strong>{ value }</strong>
      </MDBCol>
    );
  }

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
              paymentRequest.payment_status_id === 7
                ? "bg-success text-white" :
                paymentRequest.payment_status_id === 8
                ? "bg-warning text-white"
                : "bg-secondary text-white"
            }`}
            style={{ display: "inline-block" }}
          >
            <h5 className="text-white my-0">{paymentRequest.ps_pr_name}</h5>
          </strong>
        </MDBCol>
      </MDBRow>
      <MDBRow className='pb-4'>
        <KeyValue label={t("created_on")} value={formatDate(paymentRequest.pr_created_at, i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}/>
        <KeyValue label={t("due_date")} value={formatDate(paymentRequest.pr_pay_by, i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}/>
        <KeyValue label={t("payment_month")} value={formatDate(paymentRequest.payment_month, i18n.language, { year: 'numeric', month: 'long'})}/>
        <KeyValue label={t("periods_late")} value={paymentInfo.latePeriods}/>
        <KeyValue label={t("late_fee_per_period")} value={paymentRequest.fee_type+paymentRequest.late_fee.toFixed(2)}/>
        <KeyValue label={t("late_fee_total")} value={"$"+paymentInfo.accumulatedFees.toFixed(2)}/>
        <KeyValue label={t("initial_amount")} value={"$"+paymentRequest.pr_amount.toFixed(2)}/>
        <KeyValue label={t("paid_to_date")} value={"$"+paymentInfo.totalPaid.toFixed(2)}/>
        <MDBCol md="4">
          <p className="mb-0 text-muted">{t("amount_due_now")}:</p>
          <strong className={parseInt(paymentInfo.pendingPayment) > 0 ? 'text-danger' : 'text-success'}>{ "$"+paymentInfo.pendingPayment.toFixed(2) }</strong>
        </MDBCol>
        <KeyValue label={t("request_status")} value={paymentRequest.ps_pr_name}/>
        <KeyValue label={t("payment_concept")} value={paymentRequest.pt_name}/>
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
    </>
  );
}
