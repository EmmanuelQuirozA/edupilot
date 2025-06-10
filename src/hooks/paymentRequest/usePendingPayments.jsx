// src/hooks/paymentRequest/usePendingPayments.js
import { useState, useEffect, useCallback } from 'react';
import { getPendingPayment } from '../../api/paymentRequestsApi';


export default function usePendingPayments(studentId = null) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const resp = await getPendingPayment(studentId);
      setData(resp);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Trigger on mount and whenever studentId changes:
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, reload: fetchData };
}