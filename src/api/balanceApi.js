import api from './api';

export const getAccountBalance = ({
  user_id,
  lang,
  order_by,
  order_dir,
  offset = 0,
  limit = 10,
  export_all = false
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (user_id) params.user_id = user_id;
  if (order_by) params.order_by = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/balances/account-activity', { params }).then(r => r.data);
};

export const getAccountBalanceGrouped = ({
  user_id,
  lang,
  order_by,
  order_dir,
  offset = 0,
  limit = 10,
  export_all = false
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (user_id) params.user_id = user_id;
  if (order_by) params.order_by = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/balances/account-activity-grouped', { params }).then(r => r.data);
};