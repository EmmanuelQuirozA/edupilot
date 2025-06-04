// src/pages/PaymentsReportPage.jsx
import React, { useState, useEffect }       from 'react'
import { useSearchParams }       from 'react-router-dom';
import { useTranslation }        from 'react-i18next'
import useAuth                   from '../hooks/useAuth'
import Layout                    from '../layout/Layout'
import PaymentsTable             from '../components/tables/PaymentsTable'
import MonthlyPaymentsTable      from '../components/tables/MonthlyPaymentsTable'
import PaymentRequestsTable      from '../components/tables/PaymentRequestsTable'
import { 
  MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane
} from 'mdb-react-ui-kit';

export default function PaymentsReportPage() {
  const { t } = useTranslation();
  const { role } = useAuth() || {};
  
  
    // Permissions
  const canCreate  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canExport = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canSeeHeaderActions = ['admin','school_admin','finance'].includes(role?.toLowerCase());;
  const canSeeDebtOnlyBtn = ['admin','school_admin','finance'].includes(role?.toLowerCase());;

  // ── Preserve the active tab in URL ────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'monthlyPayments';
  const [basicActive, setBasicActive] = useState(tabFromUrl);

  const handleBasicClick = (value) => {
    if (value === basicActive) return;
    setBasicActive(value);
    setSearchParams({ tab: value });
  };
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'monthlyPayments';
    setBasicActive(currentTab);
  }, [searchParams]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <Layout pageTitle={t('payments_reports')}>
      <MDBTabs
        className="mb-3 custom-fullwidth-tabs"
        style={{ backgroundColor: 'white', borderRadius: '0.5rem' }}
      >
        {['monthlyPayments','paymentRequests','payments'].map((tab, i, arr) => (
          <MDBTabsItem key={tab} className="flex-fill">
            <MDBTabsLink
              onClick={() => handleBasicClick(tab)}
              active={basicActive === tab}
            >
              { i === 0 && t('tuition_fees') }
              { i === 1 && t('payment_requests') }
              { i === 2 && t('payments') }
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>

      <MDBTabsContent>
        <MDBTabsPane open={basicActive === 'monthlyPayments'}>
          {/* Monthly Payments Report */}
          <MonthlyPaymentsTable
            canExport={canExport}
            canSeeHeaderActions={canSeeHeaderActions}
            canSeeDebtOnlyBtn={canSeeDebtOnlyBtn}
            canCreate={canCreate}
          />
        </MDBTabsPane>
        <MDBTabsPane open={basicActive === 'paymentRequests'}>
          {/* Payments Requests Report */}
          <PaymentRequestsTable
            canExport={canExport}
            canSeeHeaderActions={canSeeHeaderActions}
            canSeeDebtOnlyBtn={canSeeDebtOnlyBtn}
            canCreate={canCreate}
          />
        </MDBTabsPane>
        <MDBTabsPane open={basicActive === 'payments'}>
          {/* ------- Payments Report ------- */}
          <PaymentsTable
            fullList={true}
            canExport={canExport}
            canSeeHeaderActions={canSeeHeaderActions}
            canCreate={canCreate}
          />
        </MDBTabsPane>
      </MDBTabsContent>
      {/* --- Balance Recharges --- */}
      {/* <BalanceRechargesTable
        fullList={true}
        canExport={canExport}
      /> */}
    </Layout>
  );
}
