// src/hooks/usePaymentsReport.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getPaymentRequests } from '../api/studentApi';
import { getStudents } from '../api/studentApi';
import { TextWrap } from 'react-bootstrap-icons';
import LinkCell from '../components/common/LinkCell';
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBIcon } from 'mdb-react-ui-kit'
import swal from 'sweetalert'
import { Link } from 'react-router-dom'

export default function usePaymentsReport({   
  student_id,
  fullList,
  payment_request_id,
  pr_created_start,
  pr_created_end,
  pr_pay_by_start,
  pr_pay_by_end,
  payment_month_start,
  payment_month_end,
  ps_pr_name,
  pt_name,
  payment_reference,
  student_full_name,
  sc_enabled,
  u_enabled,
  g_enabled,
  pr_payment_status_id,
  grade_group
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
  const [exportLoading, setExportLoading] = useState(true);
  const [error, setError]     = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  
  // Function to open student details modal
  const openStudentDetailsModal = async (student_id) => {
    try {
      const student = await getStudents(student_id, i18n.language)
      setSelectedStudent(student)
      setShowStudentDetailModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };
  
  // Helper function to format dates/datetimes
  const formatDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (i18n.language === 'es') {
      const formatted = new Intl.DateTimeFormat('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(date);
      return formatted.replace(/ de (\d{4})$/, ' del $1');
    } else {
      return new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(date);
    }
  };

  // helper to turn "2025-07-01" → "July 2025" (or "julio 2025" when in Spanish)
  const formatMonthYear = value => {
    if (!value) return '';
    // split the incoming date string and construct a local‐time Date
    const [year, month] = value.split('-').map(Number);
    // monthIndex is zero-based
    const d = new Date(year, month - 1);
    return new Intl.DateTimeFormat(i18n.language, {
      month: 'long',
      year:  'numeric'
    }).format(d);
  };

  // 1) fetch one page
  const fetchPage = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getPaymentRequests({
        student_id,
        payment_request_id,
        pr_created_start,
        pr_created_end,
        pr_pay_by_start,
        pr_pay_by_end,
        payment_month_start,
        payment_month_end,
        ps_pr_name,
        pt_name,
        payment_reference,
        student_full_name,
        sc_enabled,
        u_enabled,
        g_enabled,
        pr_payment_status_id,
        grade_group,
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
    payment_request_id,
    pr_created_start,
    pr_created_end,
    pr_pay_by_start,
    pr_pay_by_end,
    payment_month_start,
    payment_month_end,
    ps_pr_name,
    pt_name,
    payment_reference,
    student_full_name,
    sc_enabled,
    u_enabled,
    g_enabled,
    pr_payment_status_id,
    grade_group, 
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
    return getPaymentRequests({
      student_id,
      payment_request_id,
      pr_created_start,
      pr_created_end,
      pr_pay_by_start,
      pr_pay_by_end,
      payment_month_start,
      payment_month_end,
      ps_pr_name,
      pt_name,
      payment_reference,
      student_full_name,
      sc_enabled,
      u_enabled,
      g_enabled,
      pr_payment_status_id,
      grade_group,
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
  if (fullList) {
    columns.push(
      { name: t('payment_request_id'), selector: r => r.payment_request_id, sortable: true, sortField: 'payment_request_id', width: '120px' },
      { name: t('full_name'), selector: r => r.student_full_name, sortable: true, sortField: 'student_full_name', wrap: true,
        cell: row => {
          return (
            <LinkCell
              id={row.student_id}
              text={row.student_full_name}
              onClick={openStudentDetailsModal}
            />
          );
        },
        width: '275px'
      },
      { name: t('payment_reference'), selector: r => r.payment_reference, sortable: true, sortField: 'payment_reference', wrap: true},
      { name: t('generation'), selector: r => r.generation, sortable: true, sortField: 'generation', wrap: true},
      { name: t('grade_group'), selector: r => r.grade_group, sortable: true, sortField: 'grade_group', wrap: true},
      { name: t('pt_name'), selector: r => r.pt_name, sortable: true, sortField: 'pt_name', wrap: true},
      { name: t('payment_month'), selector: r => r.payment_month, sortable: true, sortField: 'payment_month', cell: row => formatMonthYear(row.payment_month), width: '170px' },
      { name: t('scholar_level_name'), selector: r => r.scholar_level_name, sortable: true, sortField: 'scholar_level_name', wrap: true},
      { name: t('requested_amount'), selector: r => r.pr_amount, sortable: true, sortField: 'pr_amount', cell: row => `$${row.pr_amount}`, width: '120px' },
      { name: t('pay_by'), selector: r => r.pr_pay_by, sortable: true, sortField: 'pr_pay_by', cell: row => formatDateTime(row.pr_pay_by), width: '120px' },
      { name: t('to_pay'), selector: r => r.to_pay, sortable: true, sortField: 'to_pay', cell: row => (row.to_pay && `$${row.to_pay}`), width: '120px' },
      { name: t('paid_to_date'), selector: r => r.total_amount_payments, sortable: true, sortField: 'total_amount_payments', cell: row => row.total_amount_payments != null ? `$${row.total_amount_payments}` : `$0`, width: '120px' },
      {
        name: t('actions'),
        ignoreRowClick: true,
        cell: row => {
          // if there's no request id you might want to disable or hide the button
          if (!row.payment_request_id) return null
          return (
            <Link to={`/paymentreports/paymentrequestdetails/${row.payment_request_id}`}>
              <MDBBtn flat size="sm">
                <MDBIcon fas icon="eye" />
              </MDBBtn>
            </Link>
          )
        }
      },
    );
  } else {
    columns.push(
      { name: t('payment_id'), selector: r => r.payment_id, sortable: true, sortField: 'payment_id', width: '120px' },
      { name: t('pt_name'), selector: r => r.pt_name, sortable: true, sortField: 'pt_name', wrap: true},
      { name: t('payment_month'), selector: r => r.payment_month, sortable: true, sortField: 'payment_month', cell: row => formatMonthYear(row.payment_month), width: '170px' },
      { name: t('scholar_level_name'), selector: r => r.scholar_level_name, sortable: true, sortField: 'scholar_level_name', wrap: true},
      { name: t('requested_amount'), selector: r => r.pr_amount, sortable: true, sortField: 'pr_amount', cell: row => `$${row.pr_amount}`, width: '120px' },
      { name: t('pay_by'), selector: r => r.pr_pay_by, sortable: true, sortField: 'pr_pay_by', cell: row => formatDateTime(row.pr_pay_by), width: '120px' },
      { name: t('to_pay'), selector: r => r.to_pay, sortable: true, sortField: 'to_pay', cell: row => (row.to_pay && `$${row.to_pay}`), width: '120px' },
      { name: t('paid_to_date'), selector: r => r.total_amount_payments, sortable: true, sortField: 'total_amount_payments', cell: row => `$${row.total_amount_payments}`, width: '120px' },
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
    setShowStudentDetailModal
  };
}