// src/hooks/useMonthlyReport.js
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next';
import { getMonthlyReport } from '../api/paymentsApi';
import LinkCell from '../components/common/LinkCell';
import { getStudentDetails } from '../api/studentApi';
import { getPaymentDetail } from '../api/paymentsApi';
import swal from 'sweetalert'
import { MDBTooltip } from 'mdb-react-ui-kit';

// Custom hook to fetch and prepare the monthly payments report
export default function useMonthlyReport(
  { 
    fullList,
    studentId,
    startDate,
    endDate,
    groupStatus,
    userStatus,
    studentFullName,
    paymentReference,
    generation,
    gradeGroup,
    scholarLevel,
    showDebtOnly
  }
) {
  const { i18n, t } = useTranslation();

  // server‐side paging state
  const [page, setPage]       = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  // sorting
  const [orderBy,   setOrderBy]   = useState('');
  const [orderDir,  setOrderDir]  = useState('');

  // raw + UI state
  const [ rawData,      setRawData ]      = useState([])
  const [ columns,      setColumns ]      = useState([])
  const [ filteredData, setFilteredData ] = useState([])
  const [ loading,      setLoading ]      = useState(true)
  const [exportLoading, setExportLoading] = useState(true);
  const [ error,        setError ]        = useState('')
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const togglePaymentDetailModal = () => setShowPaymentDetailModal(prev => !prev);

  
  const [paymentBreakdownData, setPaymentBreakdownData] = useState(null);
  const [isPaymentBreakdownModalOpen, setShowPaymentBreakdownModal] = useState(false);
  const toggleBreakdownModal = () => setShowPaymentBreakdownModal(v => !v);

  // Function to open student details modal
  const openStudentDetailsModal = async (studentId) => {
    try {
      const student = await getStudentDetails(studentId, i18n.language)
      setSelectedStudent(student?.[0] || null)
      setShowStudentDetailModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };

  // Helper mappings for month columns
  const monthMapping = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
  const translateMonthColumn = key => {
    const [mon, yr] = key.split('-');
    const year = yr.length === 2 ? '20' + yr : yr;
    return `${t(`month.${mon.toLowerCase()}`)}-${year}`;
  };

  const convertKeyToDate = key => {
    const [mon, yr] = key.split('-');
    const year = yr.length === 2 ? '20' + yr : yr;
    return `${year}-${monthMapping[mon.toLowerCase()] || '01'}`;
  };


  // Function to open the payment detail modal for a given payment_id.
  const openPaymentDetailModal = async (paymentId) => {
    try {
      const res = await getPaymentDetail(paymentId, i18n.language)
      setSelectedPayment(res.content?.[0] || null)
      setShowPaymentDetailModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };

  // 1) fetch one page
  const fetchPage = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getMonthlyReport({
        studentId,
        startDate,
        endDate,
        groupStatus,
        userStatus,
        studentFullName,
        paymentReference,
        generation,
        gradeGroup,
        scholarLevel,
        lang: i18n.language,
        offset: page * perPage,
        limit: perPage,
        export_all: false,
        showDebtOnly,
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
  }, [studentId, startDate, endDate, showDebtOnly, groupStatus, userStatus, studentFullName, paymentReference, generation, gradeGroup, scholarLevel, page, perPage, orderBy, orderDir, i18n.language, t])

  
  const filterKeys = ['student_id','user_status','group_status','u_enabled_raw','g_enabled_raw','student','payment_reference','generation','class','scholar_level'];
  const visibleFixedKeys = filterKeys.filter(k => !['student_id','user_status','group_status','u_enabled_raw','g_enabled_raw'].includes(k));
  const monthRegex = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{2,4}$/i;

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

  // 2) export all rows
  const exportAll = () => {
    setExportLoading(true);
    return getMonthlyReport({
      studentId,
      startDate,
      endDate,
      groupStatus,
      userStatus,
      studentFullName,
      paymentReference,
      generation,
      gradeGroup,
      scholarLevel,
      lang: i18n.language,
      export_all: true,
      showDebtOnly,
      order_by:   orderBy,
      order_dir:  orderDir.toLowerCase()
    })
    .then(({ content }) => {
      // strip off the flag/id from all month columns
      return content.map(row => {
        const out = { ...row }
        // for each month-column, keep only the amount (the first chunk before any space)
        Object.keys(out).forEach(k => {
          if (monthRegex.test(k)) {
            const parts = String(out[k] || '').trim().split(' ')
            out[k] = parts[0] || ''
          }
        })
        return out
      })
    })
    .finally(() => setExportLoading(false));
  };


  // 2 Build columns whenever rawData or date filters change
  useEffect(() => {
    if (!rawData.length) {
      setColumns([]);
      return;
    }

    const allKeys = Object.keys(rawData[0]);

    // 1) Fixed (non-month) columns
    const fixedCols = visibleFixedKeys
      .filter(key => allKeys.includes(key))
      .map(key => {
        if (key === 'student') {
          return {
            name: t(key),
            selector: row => row[key],
            sortable: true,
            sortField: key,
            cell: row => {
              return (
                <LinkCell
                  id={row.student_id}
                  text={row.student}
                  onClick={openStudentDetailsModal}
                />
              );
            },
            width: '275px'
          };
        }
        if (key === 'class') {
          return {
            name: t(key),
            selector: row => row[key],
            sortable: true,
            sortField: key,
            width: '90px'
          };
        }
        return {
          name: t(key),
          selector: row => row[key],
          sortable: true,
          sortField: key
        };
      });

    // 2) Dynamic month columns
    const dynamicCols = allKeys
      .filter(key => !filterKeys.includes(key))
      .filter(key =>
        !monthRegex.test(key) ||
        (startDate && endDate
          ? convertKeyToDate(key) >= startDate && convertKeyToDate(key) <= endDate
          : true
        )
      )
      .map(key => {
        if (monthRegex.test(key)) {
          return {
            name: translateMonthColumn(key),
            sortable: true,
            sortField: key,

            // only return the numeric part for sorting:
            selector: row => {
              const str = String(row[key] || '').trim();
              const m = str.match(/^(\d+(\.\d+)?)/);
              return m ? parseFloat(m[1]) : 0;
            },

            // custom sort in case you need it:
            sortFunction: (a, b) => {
              const extract = v => {
                const m = v == null ? null : String(v).trim().match(/^(\d+(\.\d+)?)/);
                return m ? parseFloat(m[1]) : null;
              };
              const va = extract(a[key]), vb = extract(b[key]);
              if (va == null && vb == null) return 0;
              if (va == null) return 1;
              if (vb == null) return -1;
              return va - vb;
            },

            cell: row => {
              const raw = String(row[key] ?? '').trim();
              let parsed = null;
            
              try {
                parsed = JSON.parse(raw);
              } catch (err) {
                return <div style={{ backgroundColor: 'red', color: 'white', padding: '5px', borderRadius: '4px', textAlign: 'center' }}>---</div>;
              }
            
              const { payments = [], total_amount = 0 } = parsed;
            
              // Style logic
              let style = {
                padding: '5px',
                borderRadius: '4px',
                textAlign: 'center',
                backgroundColor: total_amount <= 0 ? 'red' : payments.some(p => p.payment_status_id !== 3) ? 'yellow' : 'white',
                color: total_amount <= 0 ? 'white' : 'black',
                cursor: payments.length > 0 ? 'pointer' : 'default'
              };
            
              const handleClick = () => {
                if (payments.length === 1) {
                  openPaymentDetailModal(payments[0].payment_id);
                } else if (payments.length > 1) {
                  setPaymentBreakdownData({ ...parsed });
                  setShowPaymentBreakdownModal(true);
                }
              };
            
              return (
                <div style={style} onClick={handleClick}>
                  {total_amount ? `$${Number(total_amount).toFixed(2)}` : '---'}
                </div>
              );
            }
          };
        }

        // non-month dynamic columns
        return {
          name: t(key),
          selector: row => row[key],
          sortable: true,
          sortField: key
        };
      });

    setColumns([...fixedCols, ...dynamicCols]);
  }, [rawData, startDate, endDate, t]);

  // 3 Filter rows (showDebtOnly) when rawData, showDebtOnly, or date filters change
  useEffect(() => {
    if (!rawData.length) {
      setFilteredData([]);
      return;
    }
    let rows = rawData;
    if (showDebtOnly) {
      const monthKeys = Object.keys(rawData[0]).filter(k => monthRegex.test(k))
      rows = rows.filter(r =>
        monthKeys.some(k => {
          const str = String(r[k] || '').trim()
          const amt = str.includes(' ') ? str.split(' ')[0] : str.slice(0,-1)
          return !amt || amt === '0'
        })
      )
    }

    setFilteredData(rows)
  }, [rawData, showDebtOnly, startDate, endDate])

  return { 
    data: filteredData,
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
    openPaymentDetailModal,

    // Payment Breakdown data Modal
    paymentBreakdownData,
    isPaymentBreakdownModalOpen,
    setShowPaymentBreakdownModal,
    toggleBreakdownModal,

    // Student Detail Modal
    selectedStudent,
    showStudentDetailModal,
    setShowStudentDetailModal,
    openStudentDetailsModal,
    
    // Payment Detail Modal
    selectedPayment,
    showPaymentDetailModal,
    setShowPaymentDetailModal
  }
}