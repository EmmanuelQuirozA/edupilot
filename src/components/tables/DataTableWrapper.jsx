// components/tables/DataTableWrapper.jsx
import React, { useState, useId, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { CSVLink } from 'react-csv';
import NoDataComponent from '../common/NoDataComponent';
import LoadingComponent from '../common/LoadingComponent';
import usePaginationOptions from '../../hooks/usePaginationOptions';
import { 
  MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody, 
  MDBBtn, MDBIcon, MDBContainer, MDBSpinner
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';

export default function DataTableWrapper({
  title,
  columns,
  data,
  loading,
  exportLoading,

  // Serverside pagination:
  pagination,
  paginationServer,
  paginationTotalRows,
  onChangePage,
  onChangeRowsPerPage,

  sortServer,
  onSort, 

  // for CSV export
  canExport = false,
  csvFilename,
  csvHeaders,
  csvData,
  onExportAll,

  // optional actions you want to show on the right of the header
  headerActions = null,
  headerCreateRecord = null,
  // optional extra content *below* the header (e.g. filters row)
  headerExtras = null,
  conditionalRowStyles
}) {
  
  const paginationOptions = usePaginationOptions();
  const { t } = useTranslation();
  const reactId = useId(); // unique per-instance prefix

  const [allRows, setAllRows]       = useState([]);
  const [downloadTrigger, setDownloadTrigger] = useState(false);
  const [exporting, setExporting]   = useState(false);

  // Phase 2: when allRows arrives, click hidden link
  useEffect(() => {
    if (downloadTrigger && allRows.length) {
      const link = document.getElementById(`${reactId}-csv-all`);
      if (link) link.click();
      setDownloadTrigger(false);
    }
  }, [downloadTrigger, allRows, reactId]);
  
  const handleExportAll = async () => {
    if (!onExportAll) return;
    setExporting(true);
    try {
      const rows = await onExportAll();
      setAllRows(rows || []);
      // now that we've queued them into state, fire the download in useEffect
      setDownloadTrigger(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <MDBRow className='mb-3 '>
      <MDBCol>
        <MDBCard>
          <MDBCardHeader>
            <MDBRow className="d-flex justify-content-between align-items-center">
              <MDBCol><h4 className="mb-0">{title}</h4></MDBCol>
              <MDBCol className="d-flex justify-content-end gap-2">
                {headerCreateRecord}
                {/* per‐page export */}
                {canExport && !onExportAll && csvData && csvHeaders && (
                  <CSVLink
                    data={csvData}
                    headers={csvHeaders}
                    filename={csvFilename}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <MDBBtn color="light" rippleColor="dark">
                    <MDBIcon fas icon="download" className="me-1" /> {t('export')}
                  </MDBBtn>
                </CSVLink>
                )}

                {/* export-all */}
                {canExport && onExportAll && (
                  <>
                    <MDBBtn
                      color="light"
                      rippleColor="dark"
                      disabled={exporting}
                      onClick={handleExportAll}
                    >
                      {exporting
                        ? <><MDBIcon fas icon="spinner" spin className="me-1" />…</>
                        : <><MDBIcon fas icon="download" className="me-1" /> {t('export')}</>
                      }
                    </MDBBtn>
                    {/* hidden CSVLink for allRows */}
                    <CSVLink
                      id={`${reactId}-csv-all`}
                      data={allRows}
                      headers={csvHeaders}
                      filename={csvFilename}
                      style={{ display: 'none' }}
                    />
                  </>
                )}

                {/* anything else passed in */}
                {headerActions}
              </MDBCol>
            </MDBRow>
          </MDBCardHeader>
          <MDBCardBody>
            {/* extra controls (filters, date pickers, etc) */}
            {headerExtras && <div>{headerExtras}</div>}
            <DataTable
              columns={columns}
              data={data}
              progressPending={loading} 
              progressComponent={<LoadingComponent />}  

              // default sort
              // defaultSortField="created_at"
              defaultSortAsc={false}

              // server‐side pagination flags
              pagination={pagination}
              paginationServer={paginationServer}
              paginationTotalRows={paginationTotalRows}
              onChangePage={onChangePage}
              onChangeRowsPerPage={onChangeRowsPerPage}

              // server‐side sort
              sortServer={sortServer}
              onSort={onSort}

              paginationComponentOptions={{
                ...paginationOptions,
                selectAllRowsItem: false
              }}
              highlightOnHover
              responsive
              striped
              persistTableHead
              noDataComponent={<NoDataComponent message={t('no_data_available')} body={t('no_data_available_body')} />}
              conditionalRowStyles={conditionalRowStyles}
            />
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  );
}
