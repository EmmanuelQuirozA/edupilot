import api from './api';

export const getPaymentRequests = ({
  student_id,
  payment_request_id,
  pr_created_start,
  pr_created_end,
  pr_pay_by_start,
  pr_pay_by_end,
  payment_month,
  ps_pr_name,
  pt_name,
  payment_reference,
  student_full_name,
  sc_enabled,
  u_enabled,
  g_enabled,
  pr_payment_status_id,
  grade_group,
  lang,
  order_by,
  order_dir,
  offset = 0,
  limit = 10,
  export_all = false
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (student_id) params.student_id = student_id;
  if (payment_request_id) params.payment_request_id = payment_request_id;

  if (pr_created_start) params.pr_created_start = `${pr_created_start}-01`;
  if (pr_created_end) {
    const [y,m] = pr_created_end.split('-');
    const last = new Date(y, m, 0).getDate();
    params.end_date = `${pr_created_end}-${last < 10 ? '0'+last : last}`;
  };

  if (pr_pay_by_start) params.pr_pay_by_start = `${pr_pay_by_start}-01`;
  if (pr_pay_by_end) {
    const [y,m] = pr_pay_by_end.split('-');
    const last = new Date(y, m, 0).getDate();
    params.end_date = `${pr_pay_by_end}-${last < 10 ? '0'+last : last}`;
  };

  if (payment_month) params.payment_month = `${payment_month}-01`;

  if (ps_pr_name) params.ps_pr_name = ps_pr_name;
  if (pt_name) params.pt_name = pt_name;
  if (payment_reference) params.payment_reference = payment_reference;
  if (student_full_name) params.student_full_name = student_full_name;
  if (sc_enabled) params.sc_enabled = sc_enabled;
  if (u_enabled) params.u_enabled = u_enabled;
  if (g_enabled) params.g_enabled = g_enabled;
  if (pr_payment_status_id) params.pr_payment_status_id = pr_payment_status_id;
  if (grade_group) params.grade_group = grade_group;
  if (order_by) params.order_by = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/reports/paymentrequests', { params }).then(r => r.data);
};

export const getPaymentRequestDetails = (payment_request_id, lang) =>
  api.get('/api/reports/paymentrequest/details', { params: { payment_request_id, lang } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

export const updatePaymentRequest = (payment_request_id, data, lang) =>
  api.put(`/api/reports/payment-request/update/${payment_request_id}`, { data }, { params: { lang } })
    .then(r => r.data)
    .catch(err => {
      console.error("Error updating payment request:", err);
      throw err;
    });

export const validateExistence = ({
  school_id,
  group_id,
  payment_concept_id,
  payment_month
}) => {
  // Build a flat params object:
  const params = { payment_concept_id };
  if (payment_month)   params.payment_month   = payment_month;
  if (school_id)       params.school_id       = school_id;
  if (group_id)        params.group_id        = group_id;

  // Return the promise so callers can await it:
  return api
    .get('/api/payment-requests/validate-existence', { params })
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error validating existence:', err);
      throw err;
    });
};

export const createPaymentRequest = ({
  school_id,
  group_id,
  student_id,
  payment_concept_id,
  amount,
  pay_by,
  comments,
  late_fee,
  fee_type,
  late_fee_frequency,
  payment_month,
  partial_payment
}) => {
  // Build query params with exactly one of { school_id, group_id, student_id }
  const params = {};
  if (school_id)  params.school_id = school_id;
  if (group_id)   params.group_id = group_id;
  if (student_id) params.student_id = student_id;

  // The body is everything else:
  const body = {
    payment_concept_id,
    amount,
    pay_by,
    comments,
    late_fee,
    fee_type,
    late_fee_frequency,
    payment_month,
    partial_payment
  };

  return api
    .post('/api/payment-requests/create', body, { params })
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error creating payment request:', err);
      throw err;
    });
};

export const getPendingPayment = (studentId) => {

  return api
    .get(`/api/payment-requests/pending`, { params: { studentId } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error creating payment request:', err);
      throw err;
    });
};

export const getStudentPaymentRequests = (lang) => {

  return api
    .get(`/api/payment-requests/student-pending-payments`, { params: { lang } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error creating payment request:', err);
      throw err;
    });
};