
import { useApi } from '../useApi';
import { getMyGroupedPayments } from '../../api/paymentsApi';

export default function useGroupedPayments(
  { paymentId, paymentRequestId, ptName, paymentMonth, paymentCreatedAt, tuitions } = {},
  lang
) {
  const args = [
    paymentId,
    paymentRequestId,
    ptName,
    paymentMonth,
    paymentCreatedAt,
    tuitions,
    lang
  ];
  const { data, loading, error, reload } = useApi(getMyGroupedPayments, args);
  return {
    data: Array.isArray(data) ? data : [],
    loading,
    error,
    reload
  };
}
