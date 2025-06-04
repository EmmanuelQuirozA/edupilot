import api from './api';

export const getUsers = ({
  user_id,
  generation,
  school_id,
  role_id,
  full_name,
  enabled,
  lang,
  offset = 0,
  limit = 10,
  export_all = false,
  order_by,
  order_dir
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (user_id) params.user_id = user_id;
  if (generation) params.generation = generation;
  if (school_id) params.school_id = school_id;
  if (role_id) params.role_id = role_id;
  if (full_name) params.full_name = full_name;
  if (enabled) params.enabled = enabled;
  if (order_by)  params.order_by  = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/users', { params }).then(r => r.data);
};