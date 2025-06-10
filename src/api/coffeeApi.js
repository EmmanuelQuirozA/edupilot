import api from './api';

export const getMyPurchases = (lang) =>
  api.get(`/api/coffee/my-purchases`, { params: { lang } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });