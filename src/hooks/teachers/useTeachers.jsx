// src/hooks/useTeachers.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getTeachers } from '../../api/teachersApi';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit'
import swal from 'sweetalert'
import { Link } from 'react-router-dom';

export default function useTeachers({   
  user_id,
  school_id,
  full_name,
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

  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  
  // Function to open results details modal
  const openUsersModal = async (user_id) => {
    try {
      const results = await getTeachers({user_id, lang: i18n.language})
      setSelectedClass(results.content[0])
      setShowClassModal(true)
    } catch {
      swal(t('error'), t('failed_to_fetch_data'), 'error')
    }
  };

  // 1) fetch one page
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { content, totalElements } = await getTeachers({
        user_id,
        school_id,
        full_name,
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
  }, [ user_id,
    school_id,
    full_name,
    enabled,
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
    return getTeachers({
      user_id,
      school_id,
      full_name,
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
      { name: t('user')+" #", selector: r => r.user_id, sortable: true, sortField: 'user_id', wrap: true, width: '100px',},
      { name: t('username'), selector: r => r.username, sortable: true, sortField: 'username', wrap: true},
      { name: t('full_name'), selector: r => r.full_name, sortable: true, sortField: 'full_name', wrap: true},
      { name: t('school'), selector: r => r.commercial_name, sortable: true, sortField: 'commercial_name', wrap: true},
      { name: t('user_status'), selector: r => r.user_status, sortable: true, sortField: 'user_status', wrap: true},
      {
        name: t('actions'),
        cell: (row) => (
          <Link to={`/teachers/${row.user_id}`}>
            <MDBBtn flat size="sm">
              <MDBIcon fas icon="eye" />
            </MDBBtn>
          </Link>
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
    setSelectedClass,
    selectedClass,
    showClassModal,
    setShowClassModal,
    conditionalRowStyles,
    reload: fetchData
  };
}