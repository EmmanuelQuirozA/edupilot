import api from './api';


export const getSchools = (lang, status_filter) =>
  api.get(`/api/schools/list`, { params: { lang, status_filter } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });