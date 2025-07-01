// src/hooks/useMenu.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCoffeeMenu,getMenuDetails } from '../../api/coffeeApi';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit'
import swal from 'sweetalert'

export default function useMenu({   
  search_criteria,
  enabled
}) {
  const { i18n, t } = useTranslation();

  // server‐side paging state:
  const [page, setPage]         = useState(0);
  const [perPage, setPerPage]   = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  // sorting
  const [orderBy,   setOrderBy]   = useState('');
  const [orderDir,  setOrderDir]  = useState('');

  const [data, setRawData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(true);
  const [error, setError]     = useState('');

  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  
  // Function to open results details modal
  const openMenuModal = async (menu_id) => {
    try {
      const results = await getMenuDetails(menu_id)
      setSelectedMenu(results)
      setShowMenuModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };

  // 1) fetch one page
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getCoffeeMenu({
        search_criteria,
        enabled,
        lang: i18n.language,
        offset: page * perPage,
        limit: perPage,
        export_all: false,
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
  }, [ search_criteria, enabled,
    page, perPage, orderBy, orderDir, i18n.language, t])

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const conditionalRowStyles = [
    {
      when: row => row.enabled === false, // adjust condition based on your data type
      style: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)', // a light red background
      },
    },
  ];

  // export all:
  const exportAll = () => {
    setExportLoading(true);
    return getCoffeeMenu({
      search_criteria,
      enabled,
      lang:       i18n.language,
      export_all: true,
      order_by:   orderBy,
      order_dir:  orderDir.toLowerCase()
    })
    .then(({ content }) => {
      // content now contains *all* rows: pass to your CSV component
      return content;
    })
    .finally(() => setExportLoading(false));
  };

  // Build columns conditionally based on fullList
  const columns = [];

  // Full list
    columns.push(
      { name: t('id')+" #", selector: r => r.menu_id, sortable: true, sortField: 'menu_id', wrap: true},
      { name: t('code'), selector: r => r.code, sortable: true, sortField: 'code', wrap: true},
      { name: t('name'), selector: r => r.name, sortable: true, sortField: 'name', wrap: true},
      { name: t('price'), selector: r => ('$'+r.price.toFixed(2)), sortable: true, sortField: 'price', wrap: true},
      { name: t('status'), selector: r => r.menu_status, sortable: true, sortField: 'menu_status', wrap: true},
      {
        name: t('actions'),
        cell: (row) => (
          <div className='d-flex gap-3'>
            <MDBBtn 
              size="sm" 
              onClick={() => {
                openMenuModal(row.menu_id);
              }}
            >
              <MDBIcon fas icon="pen" className="cursor-pointer" />
            </MDBBtn>
          </div>
        ),
        ignoreRowClick: true,
        // 1) We can use width or minWidth:
        // width: '400px',
        // 2) both cell _and_ header need nowrap
        style:      { whiteSpace: 'nowrap' },      // applies to each cell
        headerStyle:{ whiteSpace: 'nowrap' },      // applies to the header
        // 3) tells the table this is a button-ish column
        button:     true,
      },
    );

  return { 
    data, 
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

    // class Detail Modal
    setSelectedMenu,
    selectedMenu,
    showMenuModal,
    setShowMenuModal,
    conditionalRowStyles,
    reload: fetchData
  };
}