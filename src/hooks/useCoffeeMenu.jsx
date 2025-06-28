// src/hooks/useCoffeeMenu.js
import { useState, useEffect, useCallback } from 'react';
import { getCoffeeMenu } from '../api/coffeeApi';
import { useTranslation } from 'react-i18next';

export default function useCoffeeMenu(search_criteria) {
  const { i18n, t } = useTranslation();
  const [menu, setMenu]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

    // 1) fetch one page
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getCoffeeMenu({
        search_criteria,
        enabled: true,
        lang: i18n.language
        // ,
        // offset: page * 6,
        // limit: 6,
        // export_all: false,
        // order_by:   orderBy,
        // order_dir:  orderDir
      })
      setMenu(content)
      // setTotalRows(totalElements)
      setError('')
    } catch {
      setError(t('failed_to_fetch_data'))
    } finally {
      setLoading(false)
    }
  }, [ search_criteria,
    // page, perPage, orderBy, orderDir, 
    i18n.language, t])

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  return { menu, loading, error };
}
