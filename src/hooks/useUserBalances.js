// src/hooks/useUserBalances.js
import { useState, useEffect } from 'react';
import { getUserBalances } from '../api/coffeeApi';

export default function useUserBalances(lang) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    getUserBalances(lang)
      .then(data => {
        setUsers(data);
        setError(null);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [lang]);

  return { users, loading, error };
}
