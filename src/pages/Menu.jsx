// src/pages/Menu.jsx
import React from 'react'
import { useTranslation }        from 'react-i18next'
import { useAuth } 							from '../context/AuthContext';
import Layout                    from '../layout/Layout'
import MenuTable             from '../components/tables/MenuTable'

export default function Menu() {
	const { t } = useTranslation();
	const { role } = useAuth() || {};
	const canExport = ['admin','school_admin'].includes(role?.toLowerCase());
	const canSeeHeaderActions=true;

	// ── Render ────────────────────────────────────────────────────────
	return (
		<Layout pageTitle={t('menu')}>
	
			{/* ------- Payments Report ------- */}
			<MenuTable
				fullList={true}
				canExport={canExport}
				canSeeHeaderActions={canSeeHeaderActions}
			/>

		</Layout>
	);
}
