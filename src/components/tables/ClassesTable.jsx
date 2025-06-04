// src/components/tables/ClassesTable.jsx
import React, { useState, useEffect } from 'react'
import useAuth                        from '../../hooks/useAuth';
import { useTranslation }             from 'react-i18next'
import useClasses                     from '../../hooks/classes/useClasses'
import useClassActions                from '../../hooks/classes/useClassActions';
import DataTableWrapper               from '../tables/DataTableWrapper'
import FiltersSidebar                 from '../common/FiltersSidebar'
import FormModal                      from '../modals/FormModal'
import { MDBBtn, MDBIcon }            from 'mdb-react-ui-kit'
import { pick }                       from 'lodash'
import CreateClassModal              from '../classes/modals/CreateClassModal';

export default function ClassesTable({ 
  canExport,
  canSeeHeaderActions = true 
}) {
  const { t } = useTranslation();
  const [showCreateModal, setCreateShowModal] = useState(false);

  const { role } = useAuth() || {};

  // Permissions
  const canUpdateRequest    = ['admin','school_admin'].includes(role?.toLowerCase());
  const canCreate  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canCloseRequest     = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canPrint            = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  
  // ── Your uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    group_id:'',
    generation:'',
    grade_group:'',
    scholar_level_name:'',
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
    error,

    totalRows,
    page,
    perPage,
    handlePageChange,
    handlePerRowsChange,
    exportAll,

    // sorting
    handleSort,

    // class Detail Modal
    setSelectedClass,
    selectedClass,
    showClassModal,
    setShowClassModal,

    conditionalRowStyles,
    reload
  } = useClasses({
    group_id: appliedFilters.group_id,
    generation: appliedFilters.generation,
    grade_group: appliedFilters.grade_group,
    scholar_level_name: appliedFilters.scholar_level_name,
    enabled: appliedFilters.enabled
  });

  // wrap reload so it also closes the modal
  const onClassSuccess = () => {
    reload();
    setShowClassModal(false);
  };
  const { isSaving, updateClass, changeClassStatus } = useClassActions(onClassSuccess);
  
  
  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const {
      group_id, generation, grade_group,
      scholar_level_name, enabled
    } = f;

    if (group_id)           out = out.filter(r => String(r.group_id) === group_id);
    if (generation)         out = out.filter(r => r.generation?.toLowerCase().includes(generation.toLowerCase()));
    if (grade_group)        out = out.filter(r => r.grade_group?.toLowerCase().includes(grade_group.toLowerCase()));
    if (scholar_level_name) out = out.filter(r => r.scholar_level_name?.toLowerCase().includes(scholar_level_name.toLowerCase()));
    if (enabled)         out = out.filter(r => String(r.enabled) === enabled);
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
    'group_id',
    'generation',
    'grade_group',
    'scholar_level_name',
    'group_status',
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
  const classFormGroups = [
    {
      groupTitle: '',
      columns:    2,
      fields: [
        { key: 'generation', label: 'generation', type: 'text', required: true},
        { key: 'scholar_level_name', label: 'scholar_level_name', type: 'text', required: true },
      ],
    },
    {
      groupTitle: '',
      columns:    2,
      fields: [
        { key: 'grade', label: 'grade', type: 'number', required: true },
        { key: 'group', label: 'group', type: 'text', required: true },
      ],
    }
  ];
  
  return (
    <>
      <DataTableWrapper
        title={t('classes')}
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
        csvFilename={t('classes')+".csv"}
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
          { id: 'group_id', label: t('group_id'), type: 'number', value: filters.group_id,
            onChange: v => setFilters(f => ({ ...f, group_id: v })) },
          { id: 'generation', label: t('generation'), type: 'text', value: filters.generation,
            onChange: v => setFilters(f => ({ ...f, generation: v })) },
          { id: 'grade_group', label: t('grade_group'), type: 'text', value: filters.grade_group,
            onChange: v => setFilters(f => ({ ...f, grade_group: v })) },
          { id: 'scholar_level_name', label: t('scholar_level_name'), type: 'text', value: filters.scholar_level_name,
            onChange: v => setFilters(f => ({ ...f, scholar_level_name: v })) },
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

            
      {/* class Update Modal */}
      <FormModal
        show={showClassModal}
        setShow={setShowClassModal}
        formGroups={classFormGroups}
        data={selectedClass || {}}
        setData={setSelectedClass}
				onSave={() => updateClass(selectedClass)}
				title={t('update_class')}
				size="xl"
				idPrefix="update_"
				isSaving={isSaving}
				changeStatus={true}
				handleStatusSwitchChange={() => changeClassStatus(selectedClass)}
      />

      <CreateClassModal show={showCreateModal} setShow={setCreateShowModal} onSuccess={onClassSuccess} />
    </>
  );
}
