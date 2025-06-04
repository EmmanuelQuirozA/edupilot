import api from './api';

export const getStudents = ({
  student_id,
  full_name,
  payment_reference,
  generation,
  grade_group,
  enabled,
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
  if (enabled) params.enabled = enabled;
  if (order_by)  params.order_by  = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/students', { params }).then(r => r.data);
};

export const createStudents = (studentsArray, lang) => {
  return api
    .post(
      '/api/students/create',
      studentsArray,
      { params: { lang } }
    )
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error in createStudents:', err);
      throw err;
    });
};