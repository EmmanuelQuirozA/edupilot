// src/components/tables/CoffeeSalesTable.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation }             from 'react-i18next'
import { MDBBtn, MDBIcon }            from 'mdb-react-ui-kit'
import { pick }                       from 'lodash'
import useCoffeeSales                 from '../../hooks/useCoffeeSales'
import DataTableWrapper               from '../tables/DataTableWrapper'
import FiltersSidebar                 from '../common/FiltersSidebar'
import DetailsModal                   from '../modals/DetailsModal'

export default function CoffeeSalesTable({ 
  studentId, 
  canExport,
  canCreate,
  canSeeHeaderActions = true 
}) {
  const { t } = useTranslation();
  
  // ── uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    fullList:'',
    school_id:'',
    full_name:'',
    item_name:'',
    created_at:''
  };
  const [filters, setFilters]               = useState(defaultFilters);

  // ── The filters you’ve actually “applied” ─────────────────────────
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  
  // ── Where filtered rows live ─────────────────────────────────
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
    
  } = useCoffeeSales({
    fullList: true,
    school_id: appliedFilters.school_id,
    full_name: appliedFilters.full_name,
    item_name: appliedFilters.item_name,
    created_at: appliedFilters.created_at
  });
  
  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const {
    school_id,
    full_name,
    item_name,
    created_at
    } = f;

    if (school_id) out = out.filter(r => String(r.school_id) === school_id);
    if (full_name) out = out.filter(r => r.full_name?.toLowerCase().includes(full_name.toLowerCase()));
    if (item_name) out = out.filter(r => r.item_name?.toLowerCase().includes(item_name.toLowerCase()));
    if (created_at) out = out.filter(r => r.created_at?.toLowerCase().includes(created_at.toLowerCase()));
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

  const exportKeys = [
    "coffee_sale_id",
    "sale",
    "full_name",
    "item_name",
    "created_at",
    "quantity",
    "unit_price",
    "total"
  ]
  // ── CSV prep (strip flags just like page did) ───────────────
  const csvHeaders = exportKeys.map(key => ({
    key,
    label: t(key)
  }))

  const csvData = filteredData.map(row =>
    pick(row, exportKeys)
  )
  
  // form-group definitions for DetailsModal
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
        title={t('coffee_sales')}
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
        csvFilename={t('coffee_sales')+".csv"}
        onExportAll={exportAll}
        csvHeaders={csvHeaders}
        csvData={csvData}

        // Header Extras
        headerActions={headerActions}
      />

      {/* Payments Filters Sidebar */}
      <FiltersSidebar
        filters={[
          { id: 'school_id', label: t('school_id'), type: 'text', value: filters.school_id,
            onChange: v => setFilters(f => ({ ...f, school_id: v })) },
          { id: 'full_name', label: t('full_name'), type: 'text', value: filters.full_name,
            onChange: v => setFilters(f => ({ ...f, full_name: v })) },
          { id: 'item_name', label: t('item'), type: 'text', value: filters.item_name,
            onChange: v => setFilters(f => ({ ...f, item_name: v })) },
          { id: 'created_at', label: t('created_at'), type: 'date', value: filters.created_at,
            onChange: v => setFilters(f => ({ ...f, created_at: v })) }
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
            
    </>
  );
}
