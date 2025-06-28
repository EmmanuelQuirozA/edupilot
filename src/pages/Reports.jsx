// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react'
import { useSearchParams }            from 'react-router-dom';
import { useTranslation }             from 'react-i18next'
import { useAuth } 							      from '../context/AuthContext';
import Layout                         from '../layout/Layout'
import BalanceRechargesTable          from '../components/tables/BalanceRechargesTable'
import CoffeeSalesTable               from '../components/tables/CoffeeSalesTable'
import { 
  MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane
} from 'mdb-react-ui-kit';

export default function Reports() {
  const { t } = useTranslation();
  const { role } = useAuth() || {};
  
  
    // Permissions
  const canCreate  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canExport = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canSeeHeaderActions = ['admin','school_admin','finance'].includes(role?.toLowerCase());;
  const canSeeDebtOnlyBtn = ['admin','school_admin','finance'].includes(role?.toLowerCase());;

  // ── Preserve the active tab in URL ────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const [basicActive, setBasicActive] = useState(tabFromUrl);

  const handleBasicClick = (value) => {
    if (value === basicActive) return;
    setBasicActive(value);
    setSearchParams({ tab: value });
  };
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'dashboard';
    setBasicActive(currentTab);
  }, [searchParams]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <Layout pageTitle={t('reports')}>
      <MDBTabs
        className="mb-3 custom-fullwidth-tabs"
        style={{ backgroundColor: 'white', borderRadius: '40px' }}
      >
        {['dashboard','coffeeSales','balance-recharges'].map((tab, i, arr) => (
          <MDBTabsItem key={tab} className="flex-fill">
            <MDBTabsLink
              onClick={() => handleBasicClick(tab)}
              active={basicActive === tab}
            >
              { i === 0 && t('dashboard') }
              { i === 1 && t('coffee_sales') }
              { i === 2 && t('balance_recharges') }
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>

      <MDBTabsContent>
        <MDBTabsPane open={basicActive === 'dashboard'}>
          {/* Main dashboard */}
        </MDBTabsPane>
        <MDBTabsPane open={basicActive === 'coffeeSales'}>
          {/* Payments Requests Report */}
          <CoffeeSalesTable
            canExport={canExport}
            canSeeHeaderActions={canSeeHeaderActions}
            canSeeDebtOnlyBtn={canSeeDebtOnlyBtn}
            canCreate={canCreate}
          />
        </MDBTabsPane>
        <MDBTabsPane open={basicActive === 'balance-recharges'}>
          {/* ------- Payments Report ------- */}
          <BalanceRechargesTable
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
