import api from './api';


export const getSchools = (lang, status_filter, school_id) =>
  api.get(`/api/schools/list`, { params: { lang, status_filter, school_id } }) 
    .then(r => r.data)
    .catch(err => {
      console.error("Error fetching the data:", err);
      throw err;
    });