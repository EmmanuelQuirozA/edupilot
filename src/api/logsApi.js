import api from './api';

export const getPaymentRequestLogs = (payment_request_id, lang) =>
  api.get(`/api/logs/payment-requests/${payment_request_id}`, { params: { lang } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

export const getPaymentLogs = (payment_id, lang) =>
  api.get(`/api/logs/payment/${payment_id}`, { params: { lang } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));