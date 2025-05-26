import api from './api';

export const getStudents = ({
  student_id,
  full_name,
  payment_reference,
  generation,
  grade_group,
  status_filter,
  lang,
  offset = 0,
  limit = 10,
  export_all = false,
  order_by,
  order_dir
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (student_id) params.student_id = student_id;
  if (full_name) params.full_name = full_name;
  if (payment_reference) params.payment_reference = payment_reference;
  if (generation) params.generation = generation;
  if (grade_group) params.grade_group = grade_group;
  if (status_filter) params.status_filter = status_filter;
  if (order_by)  params.order_by  = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/students/list', { params }).then(r => r.data);
};

export const getStudentDetails = (studentId, lang) =>
  api.get('/api/students/student-details', { params: { student_id:studentId,lang } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

export const getPayments = ({
  schoolId,
  student_id,
  payment_id,
  payment_request_id,
  student_full_name,
  payment_reference,
  generation,
  grade_group,
  pt_name,
  scholar_level_name,
  payment_month,
  payment_created_at,
  lang,
  offset = 0,
  limit = 10,
  export_all = false,
  order_by,
  order_dir
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (student_id) params.student_id = student_id;
  if (payment_id) params.payment_id = payment_id;
  if (payment_request_id) params.payment_request_id = payment_request_id;
  if (student_full_name) params.student_full_name = student_full_name;
  if (payment_reference) params.payment_reference = payment_reference;
  if (generation) params.generation = generation;
  if (grade_group) params.grade_group = grade_group;
  if (pt_name) params.pt_name = pt_name;
  if (scholar_level_name) params.scholar_level_name = scholar_level_name;
  if (payment_month) params.payment_month = `${payment_month}-01`;
  if (payment_created_at) params.payment_created_at = payment_created_at;
  if (order_by)  params.order_by  = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/reports/payments', { params }).then(r => r.data);
};

export const getPaymentDetail = (paymentId, lang) =>
  api.get('/api/reports/payments', { params: { payment_id: paymentId, lang } })
     .then(r => Array.isArray(r.data) ? r.data[0] : r.data)
     .catch(err => console.error("Error loading data:", err));

export const getMonthlyReport = ({ 
  schoolId,
  studentId,
  startDate,
  endDate,
  groupStatus,
  userStatus,
  studentFullName,
  paymentReference,
  generation,
  gradeGroup,
  scholarLevel,
  lang,
  offset = 0,
  limit = 10,
  export_all = false,
  showDebtOnly = 0,
  order_by,
  order_dir
 }) => {
  const params = { lang, offset, limit, export_all  };
  if (studentId) params.student_id = studentId;
  if (startDate) params.start_date = `${startDate}-01`;
  if (endDate) {
    const [y,m] = endDate.split('-');
    const last = new Date(y, m, 0).getDate();
    params.end_date = `${endDate}-${last < 10 ? '0'+last : last}`;
  }
  if (groupStatus) params.group_status = groupStatus;
  if (userStatus) params.user_status = userStatus;
  if (studentFullName) params.student_full_name = studentFullName;
  if (paymentReference) params.payment_reference = paymentReference;
  if (generation) params.generation = generation;
  if (gradeGroup) params.grade_group = gradeGroup;
  if (scholarLevel) params.scholar_level = scholarLevel;
  if (showDebtOnly) params.show_debt_only = showDebtOnly;
  if (order_by)  params.order_by  = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/reports/payments/report', { params }).then(r => r.data);
};

export const getPaymentRequests = ({
  student_id,
  payment_request_id,
  pr_created_start,
  pr_created_end,
  pr_pay_by_start,
  pr_pay_by_end,
  payment_month_start,
  payment_month_end,
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

  if (payment_month_start) params.payment_month_start = `${payment_month_start}-01`;
  if (payment_month_end) {
    const [y,m] = payment_month_end.split('-');
    const last = new Date(y, m, 0).getDate();
    params.end_date = `${payment_month_end}-${last < 10 ? '0'+last : last}`;
  };

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

export const getBalanceRecharges = (userId, lang) =>
  api.get('/api/reports/balancerecharges', { params: { user_id: userId, lang } })
     .then(r => r.data)
     .catch(err => console.error("Error loading data:", err));

export const getSchools = (lang) =>
  api.get('/api/schools/list', { params: { lang, status_filter: -1 } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

export const getPaymentRequestDetails = (payment_request_id, lang) =>
  api.get('/api/reports/paymentrequest/details', { params: { payment_request_id, lang } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

    
export const getPaymentRequestLogs = (payment_request_id, lang) =>
  api.get(`/api/logs/payment-requests/${payment_request_id}`, { params: { lang } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

export const getPaymentLogs = (payment_id, lang) =>
  api.get(`/api/logs/payment/${payment_id}`, { params: { lang } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

export const updatePaymentRequest = (payment_request_id, data, lang) =>
  api.put(`/api/reports/payment-request/update/${payment_request_id}`, { data }, { params: { lang } })
    .then(r => r.data)
    .catch(err => {
      console.error("Error updating payment request:", err);
      throw err;
    });

export function createPayment(data, lang) {
  return api.post('/api/payments/create',data,{ params: { lang } }
  ).then(r => r.data);
}

export const getPaymentConcepts = (lang) =>
  api.get(`/api/catalog/payment-concepts`, { params: { lang } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });
/**
 * Download a protected file by filename.
 * @param {string} filename
 * @param {string} lang
 * @returns {Promise<Blob>}
 */
export const getProtectedFile = (filename) =>
  api.get(`/api/protectedfiles/${filename}`, {
    responseType: 'blob'
  })
  .then(r => r.data)
  .catch(err => {
    console.error('Error fetching protected file:', err);
    throw err;
  });

export const getPaymentStatuses = (filename) =>
  api.get(`/api/protectedfiles/${filename}`) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });

export const getPaymentThrough = (lang) =>
  api.get(`/api/catalog/payment-through`, { params: { lang } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });
    

// export const updatePayment = (
//   payment_id,
//   data = {},                        // e.g. { amount: 150, comments: "…" }
//   lang,
//   { removeReceipt = false, receipt = null } = {}
// ) => {
//   const params = { lang };
//   if (removeReceipt) params.removeReceipt = true;

//   // detect if the caller passed any data keys
//   const hasData = data && Object.keys(data).length > 0;
//   let body;
//   const headers = {};

//   if (receipt) {
//     // Case A) file upload (and optional field updates)
//     const formData = new FormData();
//     // JSON part (empty {} if no data)
//     formData.append(
//       'request',
//       new Blob([JSON.stringify(data || {})], { type: 'application/json' })
//     );
//     // file part
//     formData.append('receipt', receipt);
//     body = formData;
//     // leave out Content-Type so the browser sets multipart boundary

//   } else if (hasData) {
//     // Case B) field-only update
//     body = data;
//     headers['Content-Type'] = 'application/json';

//   } else {
//     // Case C) removeReceipt-only
//     body = null;
//   }

//   return api
//     .put(`/api/payments/update/${payment_id}`, body, { params, headers })
//     .then(r => r.data);
// };

export const updatePaymentFields = (payment_id, data, lang) => {
  const params = { lang };
  const formData = new FormData();
  formData.append(
    'request',
    new Blob(
      [JSON.stringify({
        payment_concept_id:   data.payment_concept_id,
        payment_through_id:   data.payment_through_id,
        payment_created_at:   data.payment_created_at,
        payment_month:        data.payment_month,
        amount:               data.amount
      })],
      { type: 'application/json' }
    )
  );

  return api
    .put(`/api/payments/update/${payment_id}`, formData, { params })
    .then(r => r.data);
};

export const uploadPaymentReceipt = (payment_id, receipt, lang) => {
  const params = { lang };
  const formData = new FormData();

  // even if you don't need to change any other fields, we must include a 'request' part
  formData.append(
    'request',
    new Blob([JSON.stringify({})], { type: 'application/json' })
  );
  formData.append('receipt', receipt);

  return api
    .put(
      `/api/payments/update/${payment_id}`,
      formData,
      { params }
    )
    .then(r => r.data);
};

export const removePaymentReceipt = (payment_id, lang) => {
  const params = { lang, removeReceipt: true };

  return api
    .put(
      `/api/payments/update/${payment_id}`,
      null,
      { params }
    )
    .then(r => r.data);
};

export const updatePaymentStatus = (payment_id, newStatus, lang) => {
  const params = { lang };
  const formData = new FormData();
  // wrap your status change in the `request` part so Spring's @RequestPart("request") picks it up
  formData.append(
    'request',
    new Blob([JSON.stringify({ payment_status_id: newStatus })], {
      type: 'application/json',
    })
  );

  return api
    .put(`/api/payments/update/${payment_id}`, formData, { params })
    .then((r) => r.data);
};



    
export const uploadReceipt = (payment_id,data,lang) =>
  api.put(`/api/payments/${payment_id}/uploadReceipt?lang=${lang}`, data)
    .then(r => r.data)
    .catch(err => {
      console.error("Error updating payment:", err);
      throw err;
    });