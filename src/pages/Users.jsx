// src/pages/Users.jsx
import React                from 'react'
import { useTranslation }   from 'react-i18next'
import useAuth              from '../hooks/useAuth'
import Layout               from '../layout/Layout'
import UsersTable           from '../components/tables/UsersTable'

export default function Classes() {
  const { t } = useTranslation();
  const { role } = useAuth() || {};
  const canExport = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canSeeHeaderActions=true;


  // ── Render ────────────────────────────────────────────────────────
  return (
    <Layout pageTitle={t('users')}>
  
      {/* ------- Payments Report ------- */}
      <UsersTable
        fullList={true}
        canExport={canExport}
        canSeeHeaderActions={canSeeHeaderActions}
      />

    </Layout>
  );
}
