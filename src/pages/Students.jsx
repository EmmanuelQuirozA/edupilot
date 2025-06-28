// src/pages/Users.jsx
import React                from 'react'
import { useTranslation }   from 'react-i18next'
import { useAuth } 							 from '../context/AuthContext';
import Layout               from '../layout/Layout'
import StudentsTable           from '../components/tables/StudentsTable'

export default function Classes() {
  const { t } = useTranslation();
  const { role } = useAuth() || {};
  const canExport = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canSeeHeaderActions=true;


  // ── Render ────────────────────────────────────────────────────────
  return (
    <Layout pageTitle={t('students')}>
  
      {/* ------- Payments Report ------- */}
      <StudentsTable
        fullList={true}
        canExport={canExport}
        canSeeHeaderActions={canSeeHeaderActions}
      />

    </Layout>
  );
}
