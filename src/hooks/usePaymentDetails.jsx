// src/hooks/usePaymentDetails.js
import { useState, useEffect, useCallback } from 'react';
import { getPaymentDetail } from '../api/paymentsApi';
import { useTranslation } from 'react-i18next';

export default function usePaymentDetails(payment_id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getPaymentDetail(payment_id,i18n.language);
      const first = resp.content?.[0] ?? null;
      setData(first);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [payment_id,i18n.language]);
  
  // initial load + whenever `id` changes
  useEffect(() => { fetchData() }, [fetchData]);

  return { data, loading, error, reload: fetchData };
}
