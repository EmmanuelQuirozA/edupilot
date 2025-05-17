// src/api/auth.js
import axios from 'axios';

const API_URL = '/api/auth';

export function login(usernameOrEmail, password, lang = 'es') {
  return axios.post(
    `${API_URL}/login?lang=${lang}`,
    { usernameOrEmail, password },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
