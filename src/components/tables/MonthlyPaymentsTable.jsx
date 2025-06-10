// src/components/tables/MonthlyPaymentsTable.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation }              from 'react-i18next'
import useMonthlyReport               from '../../hooks/useMonthlyReport'
import { getSchools }                 from '../../api/studentApi'
import DataTableWrapper               from './DataTableWrapper'
import FiltersSidebar                 from '../common/FiltersSidebar'
import DetailsModal                   from '../modals/DetailsModal'
import PaymentBreakdownDetailsModal     from '../modals/PaymentBreakdownDetailsModal'
import PaymentModal from '../../components/modals/PaymentModal'
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBIcon
} from 'mdb-react-ui-kit'

export default function MonthlyPaymentsTable({
  studentId,
  fullList=false,
  canExport,
  canSeeHeaderActions = true,
  canSeeDebtOnlyBtn   = true
}) {
  const { t, i18n } = useTranslation();

  // ── Your uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    startDate:        '',
    endDate:          '',
    showDebtOnly:     false,
    school_id:        '',
    group_status:     '',
    user_status:      '',
    student:          '',
    payment_reference:'',
    generation:       '',
    class:            '',
    scholar_level:    '',
  };
  const [filters, setFilters]               = useState(defaultFilters);

  // ── The filters you’ve actually “applied” ─────────────────────────
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  // ── Where your filtered rows live ─────────────────────────────────
  const [filtered, setFilteredData]         = useState([]);

  // ── Load schools for the “school_id” filter dropdown ─────────────
  const [schoolOptions, setSchoolOptions] = useState([])
  
  useEffect(() => {
    canSeeHeaderActions &&
    getSchools(i18n.language)
      .then(raw => {
        setSchoolOptions(raw.map(s=>({
          label: s.description,
          value: s.school_id
        })))
      })
      .catch(()=>{})
  }, [i18n.language])

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
    openPaymentDetailModal,

    // Student Detail Modal
    paymentBreakdownData,
    isPaymentBreakdownModalOpen,
    // setPaymentBreakdownModalOpen,
    toggleBreakdownModal,

    // Studen Detail Modal
    selectedStudent,
    showStudentDetailModal,
    setShowStudentDetailModal,
    // openStudentDetailsModal,

    // Payment Detail Modal
    selectedPayment,
    showPaymentDetailModal,
    setShowPaymentDetailModal,
  } = useMonthlyReport({
    fullList,
    studentId,
    startDate: filters.startDate,
    endDate:   filters.endDate,
    showDebtOnly:  filters.showDebtOnly,
    groupStatus: appliedFilters.group_status,
    userStatus: appliedFilters.user_status,
    studentFullName: appliedFilters.student,
    paymentReference: appliedFilters.payment_reference,
    generation: appliedFilters.generation,
    gradeGroup: appliedFilters.class,
    scholarLevel: appliedFilters.scholar_level
  })

  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const {
      school_id, group_status, user_status,
      student, payment_reference,
      generation, class: cls, scholar_level
    } = f;

    if (school_id)         out = out.filter(r => String(r.school_id) === school_id);
    if (group_status)         out = out.filter(r => String(r.group_status) === group_status);
    if (user_status)         out = out.filter(r => String(r.user_status) === user_status);
    if (student)           out = out.filter(r => r.student?.toLowerCase().includes(student.toLowerCase()));
    if (payment_reference) out = out.filter(r => r.payment_reference?.toLowerCase().includes(payment_reference.toLowerCase()));
    if (generation)        out = out.filter(r => r.generation?.toLowerCase().includes(generation.toLowerCase()));
    if (cls)               out = out.filter(r => r.class?.toLowerCase().includes(cls.toLowerCase()));
    if (scholar_level)     out = out.filter(r => r.scholar_level?.toLowerCase().includes(scholar_level.toLowerCase()));
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
    if (!filters.showDebtOnly) {
      return Object.values(filters).filter(
        (value) => value && value.trim() !== ''
      ).length;
    }
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

  // ── Date‐pickers & “debtOnly” toggle under the header ─────────────
  const headerExtras = (
    <MDBRow className="d-flex justify-content-between">
      <MDBCol md="4">
        <MDBRow className="align-items-center">
          <MDBCol md="6" className='pb-2'>
            <MDBInput
              label={t('start_date')}
              type="month"
              value={filters.startDate}
              onChange={e=>setFilters(f=>({...f, startDate:e.target.value}))}
            />
          </MDBCol>
          <MDBCol md="6" className='pb-2'>
            <MDBInput
              label={t('end_date')}
              type="month"
              value={filters.endDate}
              onChange={e=>setFilters(f=>({...f, endDate:e.target.value}))}
            />
          </MDBCol>
        </MDBRow>
      </MDBCol>
      { canSeeDebtOnlyBtn &&
      <MDBCol md="4" className="d-flex flex-row-reverse pb-2">
        <MDBBtn
          color={filters.showDebtOnly?"warning":"secondary"}
          onClick={()=>setFilters(f=>({...f, showDebtOnly:!f.showDebtOnly}))}
        >
          <MDBIcon fas icon="exclamation-circle" className="me-1"/>
          { filters.showDebtOnly ? t('showing_debt_only') : t('show_debt_only') }
        </MDBBtn>
      </MDBCol>}
    </MDBRow>
  )

  // ── CSV prep (strip flags just like your page did) ───────────────
  const csvHeaders = filtered.length
    ? Object.keys(filtered[0]).map(key=>({ label:t(key),key }))
    : []

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

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <DataTableWrapper
        title={t('monthly_payments_report')}
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
        csvFilename={t('monthly_payments_report')+".csv"}
        onExportAll={exportAll}
        csvHeaders={csvHeaders}

        // Header Extras
        headerActions={headerActions}
        headerExtras={headerExtras}
      />

      <FiltersSidebar
        filters={[
          { id:'school_id',        label:t('school'),            type:'select', options:schoolOptions,        value:filters.school_id,        onChange:v=>setFilters(f=>({...f,school_id:v})) },
          { id:'group_status',     label:t('group_status'),     type:'select', options:[
              {label:"— "+t('select_option')+" —",value:''},
              {label:t('enabled'),     value:'true'},
              {label:t('disabled'),    value:'false'}
            ],                          value:filters.group_status,    onChange:v=>setFilters(f=>({...f,group_status:v})) },
          { id:'user_status',      label:t('user_status'),      type:'select', options:[
              {label:"— "+t('select_option')+" —",value:''},
              {label:t('enabled'),     value:'true'},
              {label:t('disabled'),    value:'false'}
            ],                          value:filters.user_status,    onChange:v=>setFilters(f=>({...f,user_status:v})) },
          { id:'student',          label:t('student'),          type:'text',     value:filters.student,      onChange:v=>setFilters(f=>({...f,student:v})) },
          { id:'payment_reference',label:t('payment_reference'),type:'text',     value:filters.payment_reference, onChange:v=>setFilters(f=>({...f,payment_reference:v})) },
          { id:'generation',       label:t('generation'),       type:'text',     value:filters.generation,   onChange:v=>setFilters(f=>({...f,generation:v})) },
          { id:'class',            label:t('class'),            type:'text',     value:filters.class,        onChange:v=>setFilters(f=>({...f,class:v})) },
          { id:'scholar_level',    label:t('scholar_level'),    type:'text',     value:filters.scholar_level,onChange:v=>setFilters(f=>({...f,scholar_level:v})) },
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

      <PaymentModal
        paymentId={selectedPayment?.payment_id}
        show={showPaymentDetailModal}
        setShow={setShowPaymentDetailModal}
      />

      <PaymentBreakdownDetailsModal
        isOpen={isPaymentBreakdownModalOpen}
        toggle={toggleBreakdownModal}
        paymentBreakdownData={paymentBreakdownData}
        openPaymentDetailModal={openPaymentDetailModal}
        navigateTo={(data) => `/paymentreports/paymentrequestdetails/${data.payment_request_id}`}
      />
    </>
  )
}
