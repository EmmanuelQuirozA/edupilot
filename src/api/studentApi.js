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

export const getBalanceRecharges = (userId, lang) =>
  api.get('/api/reports/balancerecharges', { params: { user_id: userId, lang } })
     .then(r => r.data)
     .catch(err => console.error("Error loading data:", err));

export const getSchools = (lang) =>
  api.get('/api/schools/list', { params: { lang, status_filter: -1 } })
    .then(r => r.data)
    .catch(err => console.error("Error loading data:", err));

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

export const getScholarLevels = (lang) =>
  api.get(`/api/catalog/scholar-levels`, { params: { lang } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });