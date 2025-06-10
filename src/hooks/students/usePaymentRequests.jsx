
import { useApi } from '../useApi';
import { getStudentPaymentRequests } from '../../api/paymentRequestsApi';

export default function useGroupedPayments(lang) {
  const { data, loading, error, reload } = useApi(getStudentPaymentRequests, lang);
  return {
    data: Array.isArray(data) ? data : [],
    loading,
    error,
    reload
  };
}
