import api from './api';

export const getCoffeeSales = ({
  user_id,
  school_id,
  full_name,
  item_name,
  created_at,
  lang,
  order_by,
  order_dir,
  offset = 0,
  limit = 10,
  export_all = false
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (user_id) params.user_id = user_id;
  if (school_id) params.school_id = school_id;

  if (full_name) params.full_name = full_name;
  if (item_name) params.item_name = item_name;
  if (created_at) params.created_at = created_at;

  if (order_by) params.order_by = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/coffee/sales', { params }).then(r => r.data);
};

export const getMyPurchases = (lang) =>
  api.get(`/api/coffee/my-purchases`, { params: { lang } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });

export const getCoffeeMenu = ({
  menu_id,
  search_criteria,
  enabled,
  lang,
  offset = 0,
  limit = 10,
  export_all = false,
  order_by,
  order_dir
}) =>{
  const params = { lang, offset, limit, export_all  };
  if (menu_id) params.menu_id = menu_id;
  if (search_criteria) params.search_criteria = search_criteria;
  if (enabled) params.enabled = enabled;
  if (order_by)  params.order_by  = order_by;
  if (order_dir) params.order_dir = order_dir;
  return api.get('/api/coffee/menu', { params }).then(r => r.data);
};

// export const getMenuDetails = (menu_id) =>{
//   return api.get(`/api/coffee/${menu_id}`).then(r => r.data);
// };

export const getMenuDetails = (menuId) =>
  api
    .get(`/api/coffee/${menuId}`)
    .then(r => r.data)
    .catch(err => {
      console.error("Error loading menu details:", err);
      throw err;
    });

export const getUserBalances = (search_criteria, lang) =>
  api
    .get('/api/users/balances', { params: {search_criteria, lang } })
    .then(r => r.data)
    .catch(err => {
      console.error('Error fetching user balances:', err);
      throw err;
    });