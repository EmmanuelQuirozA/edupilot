// src/components/tables/PaymentsTable.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation }             from 'react-i18next'
import { MDBBtn, MDBIcon }            from 'mdb-react-ui-kit'
import { pick }                       from 'lodash'
import CreatePaymentRequestModal      from '../paymentRequest/modals/CreatePaymentRequestModal'
import usePaymentRequestsReport       from '../../hooks/usePaymentRequestsReport'
import DataTableWrapper               from '../tables/DataTableWrapper'
import FiltersSidebar                 from '../common/FiltersSidebar'
import DetailsModal                   from '../modals/DetailsModal'

export default function PaymentsTable({ 
  studentId, 
  canExport,
  canCreate,
  canSeeHeaderActions = true 
}) {
  const { t } = useTranslation();
  const [showCreateModal, setCreateShowModal] = useState(false);
  
  // ── Your uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    student_id:'',
    payment_request_id:'',
    pr_created_start:'',
    pr_created_end:'',
    pr_pay_by_start:'',
    pr_pay_by_end:'',
    payment_month_start:'',
    payment_month_end:'',
    ps_pr_name:'',
    pt_name:'',
    payment_reference:'',
    student_full_name:'',
    sc_enabled:'',
    u_enabled:'',
    g_enabled:'',
    pr_payment_status_id:'',
    grade_group:'',
  };
  const [filters, setFilters]               = useState(defaultFilters);

  // ── The filters you’ve actually “applied” ─────────────────────────
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  
  // ── Where your filtered rows live ─────────────────────────────────
  const [filteredData, setFilteredData]         = useState([]);

  // ── Fetch report via our hook ───────────────────────────────────
  const {
    data,
    columns,
    loading,
    // error,

    totalRows,
    // page,
    // perPage,
    handlePageChange,
    handlePerRowsChange,
    exportAll,

    // sorting
    handleSort,

    // Studen Detail Modal
    selectedStudent,
    showStudentDetailModal,
    setShowStudentDetailModal,
    
    reload
  } = usePaymentRequestsReport({
    fullList: true,
    payment_request_id: appliedFilters.payment_request_id,
    pr_created_start: appliedFilters.pr_created_start,
    pr_created_end: appliedFilters.pr_created_end,
    pr_pay_by_start: appliedFilters.pr_pay_by_start,
    pr_pay_by_end: appliedFilters.pr_pay_by_end,
    payment_month_start: appliedFilters.payment_month_start,
    payment_month_end: appliedFilters.payment_month_end,
    ps_pr_name: appliedFilters.ps_pr_name,
    pt_name: appliedFilters.pt_name,
    payment_reference: appliedFilters.payment_reference,
    student_full_name: appliedFilters.student_full_name,
    sc_enabled: appliedFilters.sc_enabled,
    u_enabled: appliedFilters.u_enabled,
    g_enabled: appliedFilters.g_enabled,
    pr_payment_status_id: appliedFilters.pr_payment_status_id,
    grade_group: appliedFilters.grade_group,
  });

  // wrap reload so it also closes the modal
  const onUserSuccess = () => {
    reload();
  };
  
  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const {
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
    } = f;

    if (payment_request_id) out = out.filter(r => String(r.payment_request_id) === payment_request_id);
    if (pr_created_start) out = out.filter(r => r.pr_created_start?.toLowerCase().includes(pr_created_start.toLowerCase()));
    if (pr_created_end) out = out.filter(r => r.pr_created_end?.toLowerCase().includes(pr_created_end.toLowerCase()));
    if (pr_pay_by_start) out = out.filter(r => r.pr_pay_by_start?.toLowerCase().includes(pr_pay_by_start.toLowerCase()));
    if (pr_pay_by_end) out = out.filter(r => r.pr_pay_by_end?.toLowerCase().includes(pr_pay_by_end.toLowerCase()));
    if (payment_month_start) out = out.filter(r => r.payment_month_start?.toLowerCase().includes(payment_month_start.toLowerCase()));
    if (payment_month_end) out = out.filter(r => r.payment_month_end?.toLowerCase().includes(payment_month_end.toLowerCase()));
    if (ps_pr_name) out = out.filter(r => r.ps_pr_name?.toLowerCase().includes(ps_pr_name.toLowerCase()));
    if (pt_name) out = out.filter(r => r.pt_name?.toLowerCase().includes(pt_name.toLowerCase()));
    if (payment_reference) out = out.filter(r => r.payment_reference?.toLowerCase().includes(payment_reference.toLowerCase()));
    if (student_full_name) out = out.filter(r => r.student_full_name?.toLowerCase().includes(student_full_name.toLowerCase()));
    if (sc_enabled) out = out.filter(r => r.sc_enabled?.toLowerCase().includes(sc_enabled.toLowerCase()));
    if (u_enabled) out = out.filter(r => r.u_enabled?.toLowerCase().includes(u_enabled.toLowerCase()));
    if (g_enabled) out = out.filter(r => r.g_enabled?.toLowerCase().includes(g_enabled.toLowerCase()));
    if (pr_payment_status_id) out = out.filter(r => r.pr_payment_status_id?.toLowerCase().includes(pr_payment_status_id.toLowerCase()));
    if (grade_group) out = out.filter(r => r.grade_group?.toLowerCase().includes(grade_group.toLowerCase()));
    return out;
  };
  
  // ── Re‐filter whenever the raw data or the *applied* filters change ─
  useEffect(() => {
    setFilteredData(applyPureFilters(data, appliedFilters));
  }, [data, appliedFilters]);

  // ── “Apply” button handler: copy current inputs into appliedFilters ─
  const applyFilters = () => {
    setAppliedFilters(filters);
    handlePageChange(1)
    setFilterVisible(false);
  };

  // ── “Clear” button handler: reset both input & applied filters ─────
  const clearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    handlePageChange(1)
    setFilterVisible(false);
  };
  
	// Helper: Count active filters
	const getActiveFilterCount = () => {
		return Object.values(filters).filter(
			(value) => value && value.trim() !== ''
		).length;
	};

  // ── Sidebar toggle & header Actions ──────────────────────────────
  const [filterVisible, setFilterVisible] = useState(false)
  const headerActions = (
    <>
      { canSeeHeaderActions && (
      <MDBBtn size="sm" outline onClick={()=>setFilterVisible(v=>!v)}>
        <MDBIcon fas icon="filter" className="me-1"/> {t('filter')} {getActiveFilterCount() > 0 ? `(${getActiveFilterCount()})` : ''}
      </MDBBtn>)}
    </>
  )
  const headerCreateRecord = (
    <>
      {canCreate && (
        <MDBBtn
          color="light"
          rippleColor="dark"
          onClick={() => setCreateShowModal(true)}
        >
          <MDBIcon fas icon="add" className="me-1" />
          {t('add')}
        </MDBBtn>
      )}
    </>
  )

  const exportKeys = [
    'payment_request_id',
    'student_id',
    'payment_reference',
    'student_full_name',
    'generation',
    'scholar_level_name',
    'grade_group',
    'pr_amount',
    'pr_created_at',
    'pr_pay_by',
    'late_fee',
    'fee_type',
    'late_fee_frequency',
    'payment_month',
    'ps_pr_name',
    'pt_name',
    'total_amount_payments',
    'late_fee_total',
    'late_periods',
    'to_pay'
  ]
  // ── CSV prep (strip flags just like your page did) ───────────────
  const csvHeaders = exportKeys.map(key => ({
    key,
    label: t(key)
  }))

  const csvData = filteredData.map(row =>
    pick(row, exportKeys)
  )
  
  // Your form-group definitions for DetailsModal
  const studentDetailFormGroups = [
    {
      groupTitle: '',
      columns:    2,
      fields: [
        { key: 'full_name',         label: 'full_name',         type: 'text' },
        { key: 'payment_reference', label: 'payment_reference', type: 'text' },
      ],
    },
    {
      groupTitle: 'student_details',
      columns:    4,
      fields: [
        { key: 'generation',         label: 'generation',         type: 'text' },
        { key: 'class',        label: 'class',        type: 'text' },
        { key: 'scholar_level', label: 'scholar_level', type: 'text' },
        { key: 'commercial_name',    label: 'commercial_name',    type: 'text' },
      ],
    },
    {
      groupTitle: 'contact_and_address',
      columns:    3,
      fields: [
        { key: 'address',        label: 'address',        type: 'text'  },
        { key: 'phone_number',   label: 'phone_number',   type: 'tel'   },
        { key: 'personal_email', label: 'personal_email', type: 'email' },
      ],
    },
    {
      groupTitle: 'user_and_group_status',
      columns:    2,
      fields: [
        { key: 'user_status',  label: 'user_status',  type: 'text' },
        { key: 'group_status', label: 'group_status', type: 'text' },
      ],
    },
  ];
  
  return (
    <>
      <DataTableWrapper
        title={t('payment_requests')}
        columns={columns}
        data={data}
        loading={loading}

        // server-side
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}

        // ** server‐side sorting **
        sortServer
        onSort={handleSort}

        // export all
        canExport={canExport}
        csvFilename={t('payment_requests')+".csv"}
        onExportAll={exportAll}
        csvHeaders={csvHeaders}
        csvData={csvData}

        // Header Extras
        headerActions={headerActions}
        headerCreateRecord={headerCreateRecord}
      />

      {/* Payments Filters Sidebar */}
      <FiltersSidebar
        filters={[
          { id: 'payment_id', label: t('payment_id'), type: 'text', value: filters.payment_id,
            onChange: v => setFilters(f => ({ ...f, payment_id: v })) },
          { id: 'payment_request_id', label: t('payment_request_id'), type: 'text', value: filters.payment_request_id,
            onChange: v => setFilters(f => ({ ...f, payment_request_id: v })) },
          { id: 'student_full_name', label: t('full_name'), type: 'text', value: filters.student_full_name,
            onChange: v => setFilters(f => ({ ...f, student_full_name: v })) },
          { id: 'payment_reference', label: t('payment_reference'), type: 'text', value: filters.payment_reference,
            onChange: v => setFilters(f => ({ ...f, payment_reference: v })) },
          { id: 'generation', label: t('generation'), type: 'text', value: filters.generation,
            onChange: v => setFilters(f => ({ ...f, generation: v })) },
          { id: 'grade_group', label: t('class'), type: 'text', value: filters.grade_group,
            onChange: v => setFilters(f => ({ ...f, grade_group: v })) },
          { id: 'pt_name', label: t('pt_name'), type: 'text', value: filters.pt_name,
            onChange: v => setFilters(f => ({ ...f, pt_name: v })) },
          { id: 'scholar_level_name', label: t('scholar_level_name'), type: 'text', value: filters.scholar_level_name,
            onChange: v => setFilters(f => ({ ...f, scholar_level_name: v })) },
          { id: 'payment_month', label: t('payment_month'), type: 'month', value: filters.payment_month,
            onChange: v => setFilters(f => ({ ...f, payment_month: v })) },
          { id: 'payment_created_at', label: t('payment_created_at'), type: 'date', value: filters.payment_created_at,
            onChange: v => setFilters(f => ({ ...f, payment_created_at: v })) }
        ]}
        setFilters={setFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        isVisible={filterVisible}
        toggleVisibility={()=>setFilterVisible(v=>!v)}
      />

      {/* Student Detail Modals */}
      <DetailsModal
        show={showStudentDetailModal}
        setShow={setShowStudentDetailModal}
        formGroups={studentDetailFormGroups}
        data={selectedStudent}
        title={t('student')}
        size="xl"
        navigateTo={data => `/studentdetails/${data.student_id}`}
      />
            
      {/* Student Detail Modals */}
      <CreatePaymentRequestModal show={showCreateModal} setShow={setCreateShowModal} onSuccess={onUserSuccess} />
    </>
  );
}
