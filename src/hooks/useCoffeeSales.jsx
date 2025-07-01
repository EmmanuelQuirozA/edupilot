// src/hooks/useCoffeeSales.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCoffeeSales } from '../api/coffeeApi';
import { getStudentDetails } from '../api/studentApi';
import LinkCell from '../components/common/LinkCell';
import swal from 'sweetalert'
import { formatDate } from '../utils/formatDate';

export default function useCoffeeSales({   
  fullList,
  school_id,
  full_name,
  item_name,
  created_at
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

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  
  // Function to open student details modal
  const openStudentDetailsModal = async (student_id) => {
    try {
      const student = await getStudentDetails(student_id, i18n.language)
      setSelectedStudent(student[0])
      setShowStudentDetailModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };

  // 1) fetch one page
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getCoffeeSales({
        school_id,
        full_name,
        item_name,
        created_at,
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
    school_id,
    full_name,
    item_name,
    created_at, 
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
    return getCoffeeSales({
      school_id,
      full_name,
      item_name,
      created_at,
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
  if (fullList) {
    columns.push(
      { name: t('id')+" #", selector: r => r.coffee_sale_id, sortable: true, sortField: 'coffee_sale_id', width: '120px' },
      { name: t('order')+" #", selector: r => r.sale, sortable: true, sortField: 'sale', width: '120px' },
      { name: t('full_name'), selector: r => r.full_name, sortable: true, sortField: 'full_name', wrap: true,
        cell: row => {
          return (
            <LinkCell
              id={row.student_id}
              text={row.full_name}
              onClick={openStudentDetailsModal}
            />
          );
        },
        width: '275px'
      },
      { name: t('item'), selector: r => r.item_name, sortable: true, sortField: 'item_name', wrap: true},
      { name: t('date'), selector: r => r.created_at, sortable: true, sortField: 'created_at', cell: row => formatDate(
                row.created_at, i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })},
      { name: t('quantity'), selector: r => r.quantity, sortable: true, sortField: 'quantity', width: '120px' },
      { name: t('unit_price'), selector: r => r.unit_price, sortable: true, sortField: 'unit_price', cell: row => "$"+ row.unit_price
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ","), width: '120px' },
      { name: t('total'), selector: r => r.total, sortable: true, sortField: 'total', cell: row => "$"+ row.total
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ","), width: '120px' },
    );
  } else {
    columns.push(
      { name: t('id')+" #", selector: r => r.coffee_sale_id, sortable: true, sortField: 'coffee_sale_id', width: '120px' },
      { name: t('order')+" #", selector: r => r.sale, sortable: true, sortField: 'sale', width: '120px' },
      { name: t('item'), selector: r => r.item_name, sortable: true, sortField: 'item_name', wrap: true},
      { name: t('date'), selector: r => r.created_at, sortable: true, sortField: 'created_at', cell: row => formatDate(
                row.created_at, i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })},
      { name: t('quantity'), selector: r => r.quantity, sortable: true, sortField: 'quantity', width: '120px' },
      { name: t('unit_price'), selector: r => r.unit_price, sortable: true, sortField: 'unit_price', cell: row => "$"+ row.unit_price
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ","), width: '120px' },
      { name: t('total'), selector: r => r.total, sortable: true, sortField: 'total', cell: row => "$"+ row.total
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ","), width: '120px' },
    );
  }

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

    // Studen Detail Modal
    selectedStudent,
    showStudentDetailModal,
    setShowStudentDetailModal,
    reload: fetchData
  };
}