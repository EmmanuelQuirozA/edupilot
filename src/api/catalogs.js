import api from './api';

export const getRoles = (lang,enabled) =>
  api.get(`/api/roles`, { params: { lang,enabled } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });