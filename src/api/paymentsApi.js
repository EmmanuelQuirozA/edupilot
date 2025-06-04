import api from './api';


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

export function createPayment(data, lang) {
  return api.post('/api/payments/create',data,{ params: { lang } }
  ).then(r => r.data);
}