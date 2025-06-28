// src/components/tables/MenuTable.jsx
import React, { useState, useEffect } from 'react'
import { useAuth }                    from '../../context/AuthContext';
import { useTranslation }             from 'react-i18next'
import useMenu                        from '../../hooks/menu/useMenu'
import useMenuActions                 from '../../hooks/menu/useMenuActions';
import DataTableWrapper               from '../tables/DataTableWrapper'
import FiltersSidebar                 from '../common/FiltersSidebar'
import FormModal                      from '../modals/FormModal'
import { MDBBtn, MDBIcon }            from 'mdb-react-ui-kit'
import { pick }                       from 'lodash'
import CreateMenuModal                from '../menu/modals/CreateMenuModal';
import UpdateMenuModal                from '../menu/modals/UpdateMenuModal';

export default function MenuTable({ 
  canExport,
  canSeeHeaderActions = true 
}) {
  const { t } = useTranslation();
  const [showCreateModal, setCreateShowModal] = useState(false);

  const { role } = useAuth() || {};

  // Permissions
  const canUpdate    = ['admin','school_admin'].includes(role?.toLowerCase());
  const canCreate  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canPrint            = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  
  // ── Your uncontrolled inputs ─────────────────────────────────────
  const defaultFilters = {
    menu_id:'',
    search_criteria:'',
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
    setSelectedMenu,
    selectedMenu,
    showMenuModal,
    setShowMenuModal,

    conditionalRowStyles,
    reload
  } = useMenu({
    menu_id: appliedFilters.menu_id,
    search_criteria: appliedFilters.search_criteria,
    enabled: appliedFilters.enabled
  });

  // wrap reload so it also closes the modal
  const onMenuSuccess = () => {
    reload();
    setShowMenuModal(false);
  };
  const { isSaving, updateMenu, changeMenuStatus } = useMenuActions(onMenuSuccess);
  
  
  // ── Pure “apply these filters to these rows” helper ──────────────
  const applyPureFilters = (rows, f) => {
    let out = rows;
    const { menu_id, search_criteria, enabled } = f;

    if (menu_id)         out = out.filter(r => String(r.menu_id) === menu_id);
    if (search_criteria) out = out.filter(r => r.search_criteria?.toLowerCase().includes(search_criteria.toLowerCase()));
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
    'menu_id',
    'code',
    'name',
    'description',
    'price',
    'menu_status',
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
        title={t('menu')}
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
        csvFilename={t('menu')+".csv"}
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
          { id: 'menu_id', label: t('id')+" #", type: 'number', value: filters.menu_id,
            onChange: v => setFilters(f => ({ ...f, menu_id: v })) },
          { id: 'search_criteria', label: t('menu_search_criteria'), type: 'text', value: filters.search_criteria,
            onChange: v => setFilters(f => ({ ...f, search_criteria: v })) },
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
      {/* <FormModal
        show={showMenuModal}
        setShow={setShowMenuModal}
        formGroups={classFormGroups}
        data={selectedMenu || {}}
        setData={setSelectedMenu}
        onSave={() => updateMenu(selectedMenu)}
        title={t('update_class')}
        size="lg"
        idPrefix="update_"
        isSaving={isSaving}
        changeStatus={true}
        handleStatusSwitchChange={() => changeMenuStatus(selectedMenu)}
      /> */}

      <CreateMenuModal 
        show={showCreateModal} 
        onClose={() => setCreateShowModal(false)}
        onSuccess={onMenuSuccess} 
      />
      <UpdateMenuModal 
        show={showMenuModal} 
        onClose={() => setShowMenuModal(false)}
        onSuccess={onMenuSuccess} 
        data={selectedMenu || {}}
        setData={setSelectedMenu}
      />
    </>
  );
}
