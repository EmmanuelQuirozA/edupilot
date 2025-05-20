import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation }        from 'react-i18next'
import PaymentRequestDetails from '../components/paymentRequestDetails';
import Layout                    from '../layout/Layout'

export default function PaymentRequestDetailsPage() {
  const { t } = useTranslation();
  const { payment_request_id } = useParams();

  return (
    <Layout pageTitle={t('payment_request_details')}>
      <PaymentRequestDetails id={payment_request_id} />
    </Layout>
  );
}
