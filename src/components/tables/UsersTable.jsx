// src/components/tables/UsersTable.jsx
import React, { useState, useEffect } from 'react'
import useAuth                        from '../../hooks/useAuth';
import { useTranslation }             from 'react-i18next'
import useUsers                     from '../../hooks/users/useUsers'
import useUserActions                from '../../hooks/users/useUserActions';
import DataTableWrapper               from '../tables/DataTableWrapper'
import FiltersSidebar                 from '../common/FiltersSidebar'
import FormModal                      from '../modals/FormModal'
import { MDBBtn, MDBIcon }            from 'mdb-react-ui-kit'
import { pick }                       from 'lodash'
import CreateUserModal              from '../users/modals/CreateUserModal';

export default function UsersTable({ 
  canExport,
  canSeeHeaderActions = true 
}) {
  const { t } = useTranslation();
  const [showCreateModal, setCreateShowModal] = useState(false);

  const { role } = useAuth() || {};

  // Permissions
  const canCreate  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  
  // ── Your uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    user_id:'',
    generation:'',
    school_id:'',
    role_id:'',
    full_name:'',
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
    setSelectedUser,
    selectedUser,
    showUserModal,
    setShowUserModal,

    conditionalRowStyles,
    reload
  } = useUsers({
    user_id: appliedFilters.user_id,
    school_id: appliedFilters.school_id,
    role_id: appliedFilters.role_id,
    full_name: appliedFilters.full_name,
    enabled: appliedFilters.enabled
  });

  // wrap reload so it also closes the modal
  const onUserSuccess = () => {
    reload();
    setShowUserModal(false);
  };
  const { isSaving, updateUser, changeUserStatus } = useUserActions(onUserSuccess);
  
  
  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const {
      user_id, school_id,
      role_id, full_name, enabled
    } = f;
    if (user_id)    out = out.filter(r => String(r.user_id) === user_id);
    if (school_id)  out = out.filter(r => String(r.school_id) === school_id);
    if (role_id)    out = out.filter(r => String(r.role_id) === role_id);
    if (full_name)  out = out.filter(r => r.full_name?.toLowerCase().includes(full_name.toLowerCase()));
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
    'user_id',
    'school_id',
    'role_id',
    'full_name',
    'enabled'
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
  const userFormGroups = [
    {
      groupTitle: '',
      columns:    2,
      fields: [
        { key: 'username', label: 'username', type: 'text', required: true},
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
        title={t('users')}
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
        csvFilename={t('users')+".csv"}
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
          { id: 'user_id', label: t('user_id'), type: 'number', value: filters.user_id,
            onChange: v => setFilters(f => ({ ...f, user_id: v })) },
          { id: 'school_id', label: t('school_id'), type: 'text', value: filters.school_id,
            onChange: v => setFilters(f => ({ ...f, school_id: v })) },
          { id: 'role_id', label: t('role_id'), type: 'text', value: filters.role_id,
            onChange: v => setFilters(f => ({ ...f, role_id: v })) },
          { id: 'full_name', label: t('full_name'), type: 'text', value: filters.full_name,
            onChange: v => setFilters(f => ({ ...f, full_name: v })) },
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

            
      {/* user Update Modal */}
      <FormModal
        show={showUserModal}
        setShow={setShowUserModal}
        formGroups={userFormGroups}
        data={selectedUser || {}}
        setData={setSelectedUser}
				onSave={() => updateUser(selectedUser)}
				title={t('update_user')}
				size="xl"
				idPrefix="update_"
				isSaving={isSaving}
				changeStatus={true}
				handleStatusSwitchChange={() => changeUserStatus(selectedUser)}
      />

      <CreateUserModal show={showCreateModal} setShow={setCreateShowModal} onSuccess={onUserSuccess} />
    </>
  );
}
