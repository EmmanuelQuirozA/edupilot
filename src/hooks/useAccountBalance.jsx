// src/hooks/useAccountBalance.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAccountBalance } from '../api/balanceApi';
import { formatDate } from '../utils/formatDate';

export default function useAccountBalance({   
  user_id
}) {
  const { i18n, t } = useTranslation();
  
  // server‐side paging state:
  const [page, setPage]         = useState(0);
  const [perPage, setPerPage]   = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  // sorting
  const [orderBy,   setOrderBy]   = useState('');
  const [orderDir,  setOrderDir]  = useState('');

  const [data, setRawData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // 1) fetch one page
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getAccountBalance({
        user_id,
        lang: i18n.language,
        offset: page * perPage,
        limit: perPage,
        export_all: false,
        order_by:   orderBy,
        order_dir:  orderDir
      })
      setRawData(content)
      setTotalRows(totalElements)
      setError('')
    } catch {
      setError(t('failed_to_fetch_data'))
    } finally {
      setLoading(false)
    }
  }, [ 
    user_id,
    page, perPage, orderBy, orderDir, i18n.language, t])

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // when the table requests a new page
  const handlePageChange = newPage => {
    setPage(newPage-1);
  };

  // when the user changes rows per page
  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage-1);
  };

  const handleSort = (column, direction) => {
    setOrderBy(column.sortField || '')
    setOrderDir(direction.toUpperCase())
  }

  // export all:
  const exportAll = () => {
    return getAccountBalance({
      user_id,
      lang:       i18n.language,
      export_all: true,
      order_by:   orderBy,
      order_dir:  orderDir.toLowerCase()
    })
    .then(({ content }) => {
      // content now contains *all* rows: pass to your CSV component
      return content;
    })
  };

  // Build columns conditionally based on fullList
  const columns = [];

  // Full list
  columns.push(
    { name: t('concept'), selector: r => r.concept, sortable: false, sortField: 'concept', wrap: true},
    // { name: t('full_name'), selector: r => r.full_name, sortable: false, sortField: 'full_name', wrap: true, width: '275px' },
    { name: t('date'), selector: r => r.created_at, sortable: false, sortField: 'created_at', cell: row => formatDate(
              row.created_at, i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })},
    { name: t('quantity'), selector: r => r.quantity, sortable: false, sortField: 'quantity', wrap: true},
    { name: t('unit_price'), selector: r => r.unit_price, sortable: false, sortField: 'unit_price', cell: row => "$"+ row.unit_price
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ","), width: '120px' },
    { name: t('amount'), selector: r => r.amount, sortable: false, sortField: 'amount', cell: row => "$"+ row.amount
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ","), width: '120px' }
  );

  return { 
    data, 
    columns, 
    loading, 
    error,

    // paging
    totalRows,
    page,
    perPage,
    handlePageChange,
    handlePerRowsChange,
    exportAll,

    // sorting
    handleSort,
  };
}