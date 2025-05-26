import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation }        from 'react-i18next'
import PaymentDetails from '../components/paymentDetails';
import Layout                    from '../layout/Layout'

export default function PaymentDetailsPage() {
  const { t } = useTranslation();
  const { payment_id } = useParams();

  return (
    <Layout pageTitle={t('payment_details')}>
      <PaymentDetails id={payment_id} />
    </Layout>
  );
}
