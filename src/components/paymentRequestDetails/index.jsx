// src/components/PaymentRequestDetails/index.jsx
import React, { useState,useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import { useReactToPrint } from 'react-to-print';
import usePaymentRequestDetails from '../../hooks/usePaymentRequestDetails';
import usePaymentRequestLogs from '../../hooks/usePaymentRequestLogs';
import Header from './Header';
import InfoCard from './InfoCard';
import StudentInfoCard from './StudentInfoCard';
import PaymentsBreakdownTable from './PaymentsBreakdownTable';
import SettingsCard from './SettingsCard';
import LogsCard from './LogsCard';
import UpdateRequestModal from './modals/UpdateRequestModal';
import UpdateRequestSettingsModal from './modals/UpdateRequestSettingsModal';
import RegisterPaymentModal from './modals/RegisterPaymentModal';
import NoDataComponent from '../common/NoDataComponent';
import LoadingComponent from '../common/LoadingComponent';
import ErrorComponent from '../common/ErrorComponent';
import { useTranslation }        from 'react-i18next'
import { MDBCard, MDBCardHeader, MDBCardBody } from 'mdb-react-ui-kit';

export default function PaymentRequestDetails({ id }) {
  const { t } = useTranslation();
  // Print functionality
  const printRef = useRef();
  // Fetch paymentRequest
  const { data, loading, error, reload } = usePaymentRequestDetails(id);
  // Fetch paymentRequest logs
  const { logs, loading:logsLoading, error:logsError, reload:logsReload } = usePaymentRequestLogs(id);

  const { role } = useAuth() || {};

  // Permissions
  const canUpdateRequest    = ['admin','school_admin'].includes(role?.toLowerCase());
  const canRegisterPayment  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canCloseRequest     = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canPrint            = ['admin','school_admin','finance'].includes(role?.toLowerCase());

  // UI state for your modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUpdateSettingsModal, setShowUpdateSettingsModal] = useState(false);

  // Modal statement
  const handleRegisterOpen = (request) => { setSelectedRequest(request); setShowRegisterModal(true); };
  const handleUpdateOpen = (request) => { setSelectedRequest(request); setShowUpdateModal(true); };
  const handleUpdateSettingsOpen = (request) => { setSelectedRequest(request); setShowUpdateSettingsModal(true); };

  // Action status
  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    reload();       // <— re-fetch the details
    logsReload();   // <— re-fetch the logs
  };
  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    reload();       // <— re-fetch the details
    logsReload();   // <— re-fetch the logs
  };
  const handleUpdateSettingsSuccess = () => {
    setShowUpdateSettingsModal(false);
    reload();       // <— re-fetch the details
    logsReload();   // <— re-fetch the logs
  };
  const handleUpdateStatusSuccess = () => {
    reload();       // <— re-fetch the details
    logsReload();   // <— re-fetch the logs
  };
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: t('payment_request')+`-${id}`,
  });

  if (!data)   return <NoDataComponent message={t("no_data_available")}  body={t("no_data_available_body")}/>;
  if (loading || logsLoading) return <LoadingComponent />;
  if (error || logsError)   return <ErrorComponent message={t('error')} body={t(error.message)} />;

  return (
    <>
      <div className="d-none d-md-flex" style={{gap: '1rem', alignItems: 'stretch'}}>
        <div ref={printRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? <LoadingComponent /> :
          <MDBCard className="mb-4 shadow-sm">
            <MDBCardHeader>
              <Header 
                data={data} 
                onPrintRequest={handlePrint} 
                onEditRequest={handleUpdateOpen} 
                onRegisterPayment={handleRegisterOpen} 
                canUpdateRequest={canUpdateRequest} 
                canRegisterPayment={canRegisterPayment}
                canPrint={canPrint}
                canCloseRequest={canCloseRequest}
                onSuccess={handleUpdateStatusSuccess}
              />
            </MDBCardHeader>
            <MDBCardBody>
              <StudentInfoCard data={data} />
              <InfoCard data={data} />
              <PaymentsBreakdownTable data={data} />
            </MDBCardBody>
          </MDBCard>}
        </div>
        {/* RIGHT COLUMN */}
        <div
          className="d-none d-md-flex"
          style={{ width: '25%', minWidth: '250px', display: 'flex', flexDirection: 'column' }}
        > 
          <SettingsCard data={data} onEditRequestSettings={handleUpdateSettingsOpen} canUpdateRequest={canUpdateRequest} />
          <LogsCard data={logs} />
        </div>
      </div>

      {showUpdateModal && selectedRequest && (
        <UpdateRequestModal
          data={selectedRequest}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showRegisterModal && selectedRequest && (
        <RegisterPaymentModal
          data={selectedRequest}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {showUpdateSettingsModal && selectedRequest && (
        <UpdateRequestSettingsModal
          data={selectedRequest}
          onClose={() => setShowUpdateSettingsModal(false)}
          onSuccess={handleUpdateSettingsSuccess}
        />
      )}
    </>
  );
}
