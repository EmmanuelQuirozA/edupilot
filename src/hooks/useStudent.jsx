
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudents } from '../api/studentApi';

export default function useStudent(
  student_id,
  full_name,
  payment_reference,
  generation,
  grade_group,
  status_filter
) {
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
  const [exportLoading, setExportLoading] = useState(true);
  const [error, setError]     = useState('');


  // 1) fetch one page
  const fetchPage = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getStudents({
        student_id,
        full_name,
        payment_reference,
        generation,
        grade_group,
        status_filter,
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
    student_id,
    full_name,
    payment_reference,
    generation,
    grade_group,
    status_filter,
    page, perPage, orderBy, orderDir, i18n.language, t])

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

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
    setExportLoading(true);
    return getStudents({
      student_id,
      full_name,
      payment_reference,
      generation,
      grade_group,
      status_filter,
      lang:       i18n.language,
      export_all: true,
      order_by:   orderBy,
      order_dir:  orderDir.toLowerCase()
    })
    .then(({ content }) => {
      // content now contains *all* rows: pass to your CSV component
      return content;
    })
    .finally(() => setExportLoading(false));
  };

  // Build columns conditionally based on fullList
  const columns = [];

  // Full list
  columns.push(
    { name: t('student_id'), selector: r => r.student_id, sortable: true, sortField: 'student_id', width: '120px' },
    { name: t('full_name'), selector: r => r.full_name, sortable: true, sortField: 'full_name', wrap: true, width: '400px'  },
    { name: t('payment_reference'), selector: r => r.payment_reference, sortable: true, sortField: 'payment_reference', wrap: true},
    { name: t('generation'), selector: r => r.generation, sortable: true, sortField: 'generation', wrap: true},
    { name: t('grade_group'), selector: r => r.grade_group, sortable: true, sortField: 'grade_group', wrap: true},
    { name: t('status'), selector: r => r.status, sortable: true, sortField: 'status', wrap: true},
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
