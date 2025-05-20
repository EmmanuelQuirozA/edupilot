// src/components/PaymentRequestDetails/index.jsx
import React, { useState } from 'react';
import usePaymentRequestDetails from '../../hooks/usePaymentRequestDetails';
import Header from './Header';
import InfoCard from './InfoCard';
import StudentInfoCard from './StudentInfoCard';
import PaymentsBreakdownTable from './PaymentsBreakdownTable';
// import PaymentsTable from './PaymentsTable';
// import LogsList from './LogsList';
// import CreatePaymentModal from './modals/CreatePaymentModal';
// import EditPaymentModal   from './modals/EditPaymentModal';
import UpdateRequestModal from './modals/UpdateRequestModal';
import RegisterPaymentModal from './modals/RegisterPaymentModal';
import NoDataComponent from '../common/NoDataComponent';
import LoadingComponent from '../common/LoadingComponent';
import { useTranslation }        from 'react-i18next'
import { MDBCard, MDBCardHeader, MDBCardBody } from 'mdb-react-ui-kit';

export default function PaymentRequestDetails({ id }) {
  const { t } = useTranslation();
  const { data, loading, error, reload } = usePaymentRequestDetails(id);

  // UI state for your modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleRegisterOpen = (request) => {
    setSelectedRequest(request);
    setShowRegisterModal(true);
  };

  const handleUpdateOpen = (request) => {
    setSelectedRequest(request);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    reload();       // <— re-fetch the details
  };
  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    reload();       // <— and again for the new payment
  };

  if (!data)   return <NoDataComponent message={t("no_data_available")}  body={t("no_data_available_body")}/>;
  if (loading) return <LoadingComponent />;
  if (error)   return <p>Error: {error.message}</p>;

  return (
    <>
      <div className="d-none d-md-flex" style={{gap: '1rem', alignItems: 'stretch'}}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? <LoadingComponent /> :
          <MDBCard className="mb-4 shadow-sm">
            <MDBCardHeader>
              <Header data={data} 
                onEditRequest={handleUpdateOpen}
                onRegisterPayment={handleRegisterOpen}
              />
            </MDBCardHeader>
            <MDBCardBody>
              <StudentInfoCard data={data} />
              <InfoCard data={data} />
              <PaymentsBreakdownTable
                data={data}
              />
            </MDBCardBody>
          </MDBCard>}
        </div>
      </div>
      {/* <InfoCard info={data.request} />
      <PaymentsTable
        payments={data.payments}
        onEdit={p => setEditing(p)}
      />
      <LogsList logs={data.logs} /> */}

      {/* {showCreate && (
        <CreatePaymentModal
          requestId={id}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editing && (
        <EditPaymentModal
          payment={editing}
          onClose={() => setEditing(null)}
        />
      )} */}

      

      {showRegisterModal && selectedRequest && (
        <RegisterPaymentModal
          data={selectedRequest}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {showUpdateModal && selectedRequest && (
        <UpdateRequestModal
          data={selectedRequest}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
