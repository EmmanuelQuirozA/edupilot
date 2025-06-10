// src/hooks/students/useStudents.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudentDetailsReadOnly } from '../../api/studentApi';


export default function usePendingPayments(studentId = null) {
  const { i18n, t } = useTranslation();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const resp = await getStudentDetailsReadOnly({studentId, lang: i18n.language});
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