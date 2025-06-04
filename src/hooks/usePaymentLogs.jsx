// src/hooks/usePaymentDetails.js
import { useState, useEffect, useCallback } from 'react';
import { getPaymentLogs } from '../api/logsApi';
import { useTranslation } from 'react-i18next';

export default function usePaymentDetails(payment_id) {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getPaymentLogs(payment_id,i18n.language);
      setLogs(resp);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [payment_id,i18n.language]);
  
  // initial load + whenever `id` changes
  useEffect(() => { fetchData() }, [fetchData]);

  return { logs, loading, error, reload: fetchData };
}
