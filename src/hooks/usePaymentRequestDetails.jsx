// src/hooks/usePaymentRequestDetails.js
import { useState, useEffect, useCallback } from 'react';
import { getPaymentRequestDetails } from '../api/studentApi';
import { useTranslation } from 'react-i18next';

export default function usePaymentRequestDetails(payment_request_id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getPaymentRequestDetails(payment_request_id,i18n.language);
      setData(resp);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [payment_request_id,i18n.language]);
  
  // initial load + whenever `id` changes
  useEffect(() => { fetchData() }, [fetchData]);

  return { data, loading, error, reload: fetchData };
}
