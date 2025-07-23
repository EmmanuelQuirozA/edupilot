import React, { useState, useEffect } from 'react';
import { useSearchParams }       from 'react-router-dom';
import Layout from '../../layout/Layout'
import { useTranslation } from 'react-i18next'
import { MDBBadge, MDBBtn, MDBCard, MDBCardBody, MDBCardHeader, MDBCardText, MDBCardTitle, MDBCol, MDBContainer, MDBIcon, MDBListGroup, MDBListGroupItem, MDBRow, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane }            from 'mdb-react-ui-kit'

import usePendingPayments from '../../hooks/paymentRequest/usePendingPayments';
import useStudent from '../../hooks/students/useStudent';
import useUserDetails from '../../hooks/users/useUserDetails';
import useGroupedPayments from '../../hooks/users/useGroupedPayments';
import usePaymentRequests from '../../hooks/students/usePaymentRequests';
// import { getAccountBalanceGrouped } from '../../api/balanceApi';

import LoadingComponent from '../../components/common/LoadingComponent';
// import ProtectedFileModal from '../../components/modals/ProtectedFileModal';

import PurchasesList from '../../components/userDetails/PurchasesList';
import PaymentHistoryCard from '../../components/userDetails/PaymentHistoryCard';
import PaymentRequestCard from '../../components/userDetails/PaymentRequestCard';
import AccountBalanceCard from '../../components/userDetails/AccountBalanceCard';

import MonthlyPaymentsTable      from '../../components/tables/MonthlyPaymentsTable'
import StudentPaymentsTable      from '../../components/tables/StudentPaymentsTable'
import StudentPaymentRequestsTable      from '../../components/tables/StudentPaymentRequestsTable'
import AccountBalanceTable      from '../../components/tables/AccountBalanceTable'
import BalanceRechargesTable from '../../components/tables/BalanceRechargesTable';

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  // const [showFileModal, setShowFileModal] = useState(false);
  // const [modalFilename, setModalFilename] = useState('');
  // const [modalFilepath, setModalFilepath] = useState('');

  // ── Preserve the active tab in URL ────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'pending';
  const [basicActive, setBasicActive] = useState(tabFromUrl);

  const handleBasicClick = (value) => {
    if (value === basicActive) return;
    setBasicActive(value);
    setSearchParams({ tab: value });
  };
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'pending';
    setBasicActive(currentTab);
  }, [searchParams]);

  // useEffect(() => {
  //   getAccountBalanceGrouped(i18n.language)
  //     .then(setAccountBalanceGroup)
  //     .catch(err => console.error('Error loading account balance group:', err));
  // }, [accountBalanceGroup,i18n.language]);


  // Fetch data 
  const { data:pendingPayment, loading:pendingPaymentsTotalLoading, error:pendingPaymentsTotalError, reload:pendingPaymentsTotalReload } = usePendingPayments();
  const { data:student, loading:studentLoading, error:studentError, reload:studentReload } = useStudent();

  const { 
    myPurchases, myPurchasesLoading, myPurchasesError, reloadMyPurchases
  } = useUserDetails();

  const { 
    data:tuitions, loading:loadingTuitions, error:errorTuitions, reload:reloadTuitions
  } = useGroupedPayments(
    {
      // paymentId: 123,
      // paymentRequestId: 456,
      // ptName: 'SomeName',
      // paymentMonth: '2025-06',
      // paymentCreatedAt: '2025-06-08T11:00:00',
      tuitions: true
    },
    i18n.language
  );
   
  const { 
    data:payments, loading:paymentsLoading, error:paymentsError, reload:reloadpayments
  } = useGroupedPayments(
    {
      // paymentId: 123,
      // paymentRequestId: 456,
      // ptName: 'SomeName',
      // paymentMonth: '2025-06',
      // paymentCreatedAt: '2025-06-08T11:00:00',
      tuitions: false
    },
    i18n.language
  );
   
  const { 
    data:paymentRequests, loading:paymentRequestsLoading, error:paymentRequestsError, reload:reloadpaymentRequests
  } = usePaymentRequests(i18n.language);

  return (
    <Layout pageTitle={t('student_portal')}>
      {pendingPaymentsTotalLoading || studentLoading ? <LoadingComponent /> :
        <div className="content-wrapper">
        <MDBRow>
          <MDBCol md="6" className="mb-4">
            <MDBCard className="h-100">
              <MDBCardBody className="d-flex align-items-center">
                <MDBIcon fas icon="dollar-sign" size="3x" className="text-danger me-4" />
                <div>
                  <p className="text-muted mb-1">{t('pending_payments')}</p>
                  <h4 className="mb-0 fw-bold">${pendingPayment?.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MXN</h4>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="6" className="mb-4">
            <MDBCard className="h-100">
              <MDBCardBody className="d-flex align-items-center">
                <MDBIcon fas icon="utensils" size="3x" className="text-success me-4" />
                <div>
                  <p className="text-muted mb-1">{t('coffee_balance')}</p>
                  <h4 className="mb-0 fw-bold">${student.balance?.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MXN</h4>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol className="mb-4">
                
            {/* ── Desktop: show table ── */}
            <div className="d-none d-md-block">
              <AccountBalanceTable
                canExport={true}
              />
            </div>
            {/* ── Mobile: show cards instead ── */}
            <div className="d-block d-md-none">
              <AccountBalanceCard  />
            </div>

          </MDBCol>
        </MDBRow>

        <MDBRow>
          {/* <MDBCol lg="7" className="mb-4">
            <MDBCard>
              <MDBCardBody>
                <MDBCardTitle><MDBIcon fas icon="bullhorn" className="me-2" /> Avisos Escolares</MDBCardTitle>
                <MDBListGroup>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-start border-0">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">Suspensión de clases</div>
                      Se suspenden las clases el próximo viernes por junta de consejo técnico.
                    </div>
                    <MDBBadge pill color='danger'>Urgente</MDBBadge>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-start border-0">
                      <div className="ms-2 me-auto">
                      <div className="fw-bold">Festival de Primavera</div>
                      El evento se realizará el 21 de marzo en el patio principal.
                    </div>
                    <MDBBadge pill color='primary'>Evento</MDBBadge>
                  </MDBListGroupItem>
                  <MDBListGroupItem className="d-flex justify-content-between align-items-start border-0">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">Campaña de vacunación</div>
                      Traer cartilla de vacunación el lunes 15 de marzo.
                    </div>
                  </MDBListGroupItem>
                </MDBListGroup>
              </MDBCardBody>
            </MDBCard>
          </MDBCol> */}

          <MDBCol className="mb-4">
            <MDBCard>
              <MDBCardBody>
                <MDBCardTitle><MDBIcon fas icon="shopping-basket" className="me-2" /> Compras Recientes en Cafetería</MDBCardTitle>
                <PurchasesList myPurchases={myPurchases} i18n={i18n}/>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol size="12">
            <MDBCard>
              <MDBCardBody>
                <MDBCardTitle><MDBIcon fas icon="history" className="me-2" /> {t('payments')}</MDBCardTitle>
                <MDBTabs
                  className="mb-3 custom-fullwidth-tabs"
                  style={{ backgroundColor: 'white', borderRadius: '40px' }}
                >
                  {['pending','made','tuition','balance_recharges'].map((tab, i, arr) => (
                    <MDBTabsItem key={tab} className="flex-fill">
                      <MDBTabsLink
                        onClick={() => handleBasicClick(tab)}
                        active={basicActive === tab}
                      >
                        { i === 0 && t('pending') }
                        { i === 1 && t('made') }
                        { i === 2 && t('tuition') }
                        { i === 3 && t('balance_recharges') }
                      </MDBTabsLink>
                    </MDBTabsItem>
                  ))}
                </MDBTabs>

                <MDBTabsContent>
                  <MDBTabsPane open={basicActive === 'pending'}>
                    {/* ── Desktop: show table ── */}
                    <div className="d-none d-md-block">
                      <StudentPaymentRequestsTable
                        fullList={false}
                        canExport={true}
                        canSeeHeaderActions={true}
                        canSeeDebtOnlyBtn={false}
                        canCreate={false}
                      />
                    </div>
                    {/* ── Mobile: show cards instead ── */}
                    <div className="d-block d-md-none">
                      <PaymentRequestCard data={paymentRequests} />
                    </div>
                  </MDBTabsPane>
                  <MDBTabsPane open={basicActive === 'made'}>
                    {/* ── Desktop: show table ── */}
                    <div className="d-none d-md-block">
                      <StudentPaymentsTable
                        fullList={false}
                        canExport={true}
                        canSeeHeaderActions={true}
                        canCreate={false}
                      />
                    </div>
                    {/* ── Mobile: show cards instead ── */}
                    <div className="d-block d-md-none">
                      <PaymentHistoryCard history={payments}/>
                    </div>
                  </MDBTabsPane>
                  <MDBTabsPane open={basicActive === 'tuition'}>
                    {/* ── Desktop: show table ── */}
                    <div className="d-none d-md-block">
                      <MonthlyPaymentsTable
                        fullList={false}
                        canExport={true}
                        canSeeHeaderActions={false}
                        canSeeDebtOnlyBtn={false}
                        canCreate={false}
                      />
                    </div>
                    {/* ── Mobile: show cards instead ── */}
                    <div className="d-block d-md-none">
                      <PaymentHistoryCard history={tuitions} tuitions={true} />
                    </div>
                  </MDBTabsPane>
                  <MDBTabsPane open={basicActive === 'balance_recharges'}>
                    {/* ── Desktop: show table ── */}
                    <div className="d-none d-md-block">
                      <BalanceRechargesTable
                        fullList={false}
                        canExport={true}
                        canSeeHeaderActions={false}
                        canSeeDebtOnlyBtn={false}
                        canCreate={false}
                      />
                    </div>
                    {/* ── Mobile: show cards instead ── */}
                    <div className="d-block d-md-none">
                      {/* <PaymentHistoryCard history={tuitions} tuitions={true} /> */}
                    </div>
                  </MDBTabsPane>
                </MDBTabsContent>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* <ProtectedFileModal
          filename={modalFilename}
          filepath={modalFilepath}
          show={showFileModal}
          onClose={() => setShowFileModal(false)}
          lang={i18n.language}
        /> */}
        </div>
      }
    </Layout>
  )
}