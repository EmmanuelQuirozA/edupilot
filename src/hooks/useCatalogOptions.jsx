// src/hooks/useCatalogOptions.js
import { useEffect, useState } from 'react';
import { getPaymentConcepts, getPaymentThrough, getPaymentStatuses } from '../api/studentApi';
import { useTranslation } from 'react-i18next';

const useCatalogOptions = (catalogName) => {
  const { i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      const lang = i18n.language;

      switch (catalogName) {
        case 'paymentConcepts':
          response = await getPaymentConcepts(lang);
          break;
        case 'paymentThrough':
          response = await getPaymentThrough(lang);
          break;
        case 'paymentStatuses':
          response = await getPaymentStatuses(lang);
          break;
        default:
          throw new Error('Invalid catalog name');
      }

      setData(response);
    } catch (err) {
      console.error(`Error loading catalog ${catalogName}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch only on-demand, not automatically
  return { data, loading, error, fetchData };
};

export default useCatalogOptions;

