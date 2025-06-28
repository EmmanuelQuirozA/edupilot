// src/hooks/useAuth.js
import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useAuth() {
  const token = localStorage.getItem('token');

  return useMemo(() => {
    if (!token) return null;
    try {
      const { role, schoolId, userId, sub, exp } = jwtDecode(token);
      // auto‐logout if expired
      if (Date.now() >= exp * 1000) {
        localStorage.removeItem('token');
        return null;
      }
      return {
        role,
        schoolId,
        userId,
        username: sub
      };
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  }, [token]);
}
