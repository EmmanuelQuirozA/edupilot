// src/hooks/users/useUserDetails.js
import { useTranslation } from 'react-i18next';
import { useApi } from '../useApi';
import { getMyPurchases } from '../../api/coffeeApi';

export default function useUserDetails(lang) {
  const { i18n } = useTranslation();
  const {
    data: myPurchases,
    loading: myPurchasesLoading,
    error: myPurchasesError,
    reload: reloadMyPurchases
  } = useApi(getMyPurchases, [i18n.language]);

  return {
    myPurchases: Array.isArray(myPurchases) ? myPurchases : [],
    myPurchasesLoading,
    myPurchasesError,
    reloadMyPurchases
  }
}