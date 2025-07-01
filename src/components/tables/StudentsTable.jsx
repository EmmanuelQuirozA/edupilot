// src/components/tables/UsersTable.jsx
import React, { useState, useEffect } from 'react'
import { useAuth }                    from '../../context/AuthContext';
import { useTranslation }             from 'react-i18next'
import useStudents                    from '../../hooks/students/useStudents'
import DataTableWrapper               from '../tables/DataTableWrapper'
import FiltersSidebar                 from '../common/FiltersSidebar'
import { MDBBtn, MDBIcon }            from 'mdb-react-ui-kit'
import { pick }                       from 'lodash'
import CreateStudentModal              from '../students/modals/CreateStudentModal';
import { Link } from 'react-router-dom';

export default function UsersTable({ 
  canExport,
  canSeeHeaderActions = true 
}) {
  const { t } = useTranslation();
  const [showCreateModal, setCreateShowModal] = useState(false);

  const { role } = useAuth() || {};

  // Permissions
  const canCreate  = ['admin','school_admin'].includes(role?.toLowerCase());
  
  // ── Your uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    student_id:'',
    register_id:'',
    full_name:'',
    payment_reference:'',
    generation:'',
    scholar_level_name:'',
    grade_group:'',
    enabled:''
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

    // class Detail Modal
    // setSelectedUser,
    // selectedUser,
    // showUserModal,
    setShowUserModal,

    conditionalRowStyles,
    reload
  } = useStudents({
    student_id: appliedFilters.student_id,
    full_name: appliedFilters.full_name,
    payment_reference: appliedFilters.payment_reference,
    generation: appliedFilters.generation,
    grade_group: appliedFilters.grade_group,
    enabled: appliedFilters.enabled
  });

  // wrap reload so it also closes the modal
  const onSuccess = () => {
    reload();
    setShowUserModal(false);
  };
  
  
  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const {
      student_id,
      full_name,
      payment_reference,
      generation,
      grade_group,
      enabled

    } = f;
    if (student_id)    out = out.filter(r => String(r.student_id) === student_id);
    if (full_name)  out = out.filter(r => r.full_name?.toLowerCase().includes(full_name.toLowerCase()));
    if (payment_reference)  out = out.filter(r => r.payment_reference?.toLowerCase().includes(payment_reference.toLowerCase()));
    if (generation)  out = out.filter(r => r.generation?.toLowerCase().includes(generation.toLowerCase()));
    if (grade_group)  out = out.filter(r => r.grade_group?.toLowerCase().includes(grade_group.toLowerCase()));
    if (enabled)    out = out.filter(r => String(r.enabled) === enabled);
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
        <>
          <Link
            to={'/students/bulkstudentsupload'}
            style={{ textDecoration: 'none' }}
          >
          <MDBBtn
            color="light"
            rippleColor="dark"
          >
            <MDBIcon fas icon="add" className="me-1" />
            {t('bulk_upload')}
          </MDBBtn>
          </Link>
          <MDBBtn
            color="light"
            rippleColor="dark"
            onClick={() => setCreateShowModal(true)}
          >
            <MDBIcon fas icon="add" className="me-1" />
            {t('add')}
          </MDBBtn>
        </>
      )}
    </>
  )

  const exportKeys = [
    'student_id',
    'register_id',
    'full_name',
    'payment_reference',
    'generation',
    'scholar_level_name',
    'grade_group',
    'user_status'
  ]
  // ── CSV prep (strip flags just like your page did) ───────────────
  const csvHeaders = exportKeys.map(key => ({
    key,
    label: t(key)
  }))

  const csvData = filteredData.map(row =>
    pick(row, exportKeys)
  )
  
  return (
    <>
      <DataTableWrapper
        title={t('students')}
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
        csvFilename={t('students')+".csv"}
        onExportAll={exportAll}
        csvHeaders={csvHeaders}
        csvData={csvData}

        // Header Extras
        headerActions={headerActions}
        headerCreateRecord={headerCreateRecord}
        conditionalRowStyles={conditionalRowStyles}
      />

      {/* Payments Filters Sidebar */}
      <FiltersSidebar
        filters={[
          { id: 'student_id', label: t('student_id'), type: 'number', value: filters.student_id,
            onChange: v => setFilters(f => ({ ...f, student_id: v })) },
          { id: 'full_name', label: t('full_name'), type: 'text', value: filters.full_name,
            onChange: v => setFilters(f => ({ ...f, full_name: v })) },
          { id: 'payment_reference', label: t('payment_reference'), type: 'text', value: filters.payment_reference,
            onChange: v => setFilters(f => ({ ...f, payment_reference: v })) },
          { id: 'generation', label: t('generation'), type: 'text', value: filters.generation,
            onChange: v => setFilters(f => ({ ...f, generation: v })) },
          { id: 'grade_group', label: t('grade_group'), type: 'text', value: filters.grade_group,
            onChange: v => setFilters(f => ({ ...f, grade_group: v })) },
          { id:'enabled',      label:t('status'),      type:'select', options:[
              {label:"— "+t('select_option')+" —",value:''},
              {label:t('enabled'),     value:'true'},
              {label:t('disabled'),    value:'false'}
            ],                          value:filters.enabled,    onChange:v=>setFilters(f=>({...f,enabled:v})) },
        ]}
        setFilters={setFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        isVisible={filterVisible}
        toggleVisibility={()=>setFilterVisible(v=>!v)}
      />

      <CreateStudentModal show={showCreateModal} setShow={setCreateShowModal} onSuccess={onSuccess} />
    </>
  );
}
