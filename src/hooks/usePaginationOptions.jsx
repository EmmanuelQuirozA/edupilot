// src/hooks/usePaginationOptions.js
import { useTranslation } from 'react-i18next';

export default function usePaginationOptions() {
  const { t } = useTranslation();

  return {
    rowsPerPageText: t('rows_per_page'),
    rangeSeparatorText: t('of'),
    selectAllRowsItem: true,
    selectAllRowsItemText: t('all'),
  };
}