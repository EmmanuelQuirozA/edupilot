// src/components/tables/AccountBalanceTable.jsx
import React from 'react'
import { useTranslation }             from 'react-i18next'
import { pick }                       from 'lodash'
import useAccountBalance              from '../../hooks/useAccountBalance'
import DataTableWrapper               from '../tables/DataTableWrapper'

export default function AccountBalanceTable({ 
  user_id, 
  canExport
}) {
  const { t } = useTranslation();
  
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

  } = useAccountBalance({
    user_id: user_id
  });

  const exportKeys = [
    'concept',
    'full_name',
    'created_at',
    'quantity',
    'unit_price',
    'amount'
  ]
  // ── CSV prep (strip flags just like your page did) ───────────────
  const csvHeaders = exportKeys.map(key => ({
    key,
    label: t(key)
  }))

  const csvData = columns.map(row =>
    pick(row, exportKeys)
  )
  
  return (
    <>
      <DataTableWrapper
        title={t('account_balance')}
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
        csvFilename={t('account_balance')+".csv"}
        onExportAll={exportAll}
        csvHeaders={csvHeaders}
        csvData={csvData}

      />
    </>
  );
}
