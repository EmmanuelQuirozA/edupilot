// src/pages/Teachers.jsx
import React from 'react'
import { useTranslation }        from 'react-i18next'
import { useAuth } 							 from '../context/AuthContext';
import Layout                    from '../layout/Layout'
import TeachersTable             from '../components/tables/TeachersTable'

export default function Teachers() {
  const { t } = useTranslation();
  const { role } = useAuth() || {};
  const canExport = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canSeeHeaderActions=true;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <Layout pageTitle={t('teachers')}>
  
      {/* ------- Payments Report ------- */}
      <TeachersTable
        canExport={canExport}
        canSeeHeaderActions={canSeeHeaderActions}
      />

    </Layout>
  );
}
