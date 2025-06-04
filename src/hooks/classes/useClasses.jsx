// src/hooks/useClasses.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getClasses } from '../../api/classesApi';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit'
import swal from 'sweetalert'

export default function useClasses({   
  group_id,
  generation,
  grade_group,
  scholar_level_name,
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
  const openClassesModal = async (group_id) => {
    try {
      const results = await getClasses({group_id, lang: i18n.language})
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
      const { content, totalElements } = await getClasses({
        group_id,
        generation,
        grade_group,
        scholar_level_name,
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
  }, [ group_id,
    generation,
    grade_group,
    scholar_level_name,
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
    return getClasses({
      group_id,
      generation,
      grade_group,
      scholar_level_name,
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
      { name: t('class')+" #", selector: r => r.group_id, sortable: true, sortField: 'group_id', wrap: true},
      { name: t('generation'), selector: r => r.generation, sortable: true, sortField: 'generation', wrap: true},
      { name: t('grade_group'), selector: r => r.grade_group, sortable: true, sortField: 'grade_group', wrap: true},
      { name: t('scholar_level_name'), selector: r => r.scholar_level_name, sortable: true, sortField: 'scholar_level_name', wrap: true},
      { name: t('group_status'), selector: r => r.group_status, sortable: true, sortField: 'group_status', wrap: true},
      {
        name: t('actions'),
        cell: (row) => (
          <div className='d-flex gap-3'>
            <MDBBtn 
              flat="true" 
              size="sm" 
              onClick={() => {
                openClassesModal(row.group_id);
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
    setSelectedClass,
    selectedClass,
    showClassModal,
    setShowClassModal,
    conditionalRowStyles,
    reload: fetchData
  };
}