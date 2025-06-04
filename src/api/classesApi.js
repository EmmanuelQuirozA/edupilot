import api from './api';


export const getClasses = ({
  group_id,
  school_id,
  generation,
  grade_group,
  scholar_level_name,
  enabled,
  lang,
  offset = 0,
  limit = 10,
  export_all = false,
  order_by,
  order_dir
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (group_id) params.group_id = group_id;
  if (school_id) params.school_id = generation;
  if (generation) params.generation = generation;
  if (grade_group) params.grade_group = grade_group;
  if (scholar_level_name) params.scholar_level_name = scholar_level_name;
  if (enabled) params.enabled = enabled;
  if (order_by)  params.order_by  = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/classes', { params }).then(r => r.data);
};