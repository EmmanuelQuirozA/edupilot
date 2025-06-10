import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout'
import { useTranslation } from 'react-i18next'
import { MDBBadge, MDBBtn, MDBCard, MDBCardBody, MDBCardTitle, MDBCol, MDBIcon, MDBListGroup, MDBListGroupItem, MDBRow, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane }            from 'mdb-react-ui-kit'

export default function Dashboard() {
const { t, i18n } = useTranslation();

	// Estado para controlar la visibilidad del sidebar en mobile
	const [isSidebarActive, setSidebarActive] = useState(false);
	
	// Estado para controlar la pestaña activa en la sección de pagos
	const [basicActive, setBasicActive] = useState('pendientes');

	// Función para alternar el estado del sidebar
	const toggleSidebar = () => {
			setSidebarActive(!isSidebarActive);
	};
	
	// Función para cambiar de pestaña
	const handleBasicClick = (value) => {
			if (value === basicActive) {
				return;
			}
			setBasicActive(value);
	};

return (
	<Layout pageTitle={t('admin_dashboard')}>
		<div className="content-wrapper">
			<MDBRow>
				<MDBCol md="6" className="mb-4">
					<MDBCard className="h-100">
						<MDBCardBody className="d-flex align-items-center">
							<MDBIcon fas icon="dollar-sign" size="3x" className="text-danger me-4" />
							<div>
								<p className="text-muted mb-1">Pagos Pendientes</p>
								<h4 className="mb-0 fw-bold">$1,850.00 MXN</h4>
							</div>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
				<MDBCol md="6" className="mb-4">
					<MDBCard className="h-100">
						<MDBCardBody className="d-flex align-items-center">
							<MDBIcon fas icon="utensils" size="3x" className="text-success me-4" />
							<div>
								<p className="text-muted mb-1">Saldo de Cafetería</p>
								<h4 className="mb-0 fw-bold">$275.50 MXN</h4>
							</div>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

			<MDBRow>
				<MDBCol lg="7" className="mb-4">
					<MDBCard>
						<MDBCardBody>
							<MDBCardTitle><MDBIcon fas icon="bullhorn" className="me-2" /> Avisos Escolares</MDBCardTitle>
							<MDBListGroup>
								<MDBListGroupItem className="d-flex justify-content-between align-items-start">
									<div className="ms-2 me-auto">
										<div className="fw-bold">Suspensión de clases</div>
										Se suspenden las clases el próximo viernes por junta de consejo técnico.
									</div>
									<MDBBadge pill color='danger'>Urgente</MDBBadge>
								</MDBListGroupItem>
								<MDBListGroupItem className="d-flex justify-content-between align-items-start">
										<div className="ms-2 me-auto">
										<div className="fw-bold">Festival de Primavera</div>
										El evento se realizará el 21 de marzo en el patio principal.
									</div>
									<MDBBadge pill color='primary'>Evento</MDBBadge>
								</MDBListGroupItem>
								<MDBListGroupItem className="d-flex justify-content-between align-items-start">
									<div className="ms-2 me-auto">
										<div className="fw-bold">Campaña de vacunación</div>
										Traer cartilla de vacunación el lunes 15 de marzo.
									</div>
								</MDBListGroupItem>
							</MDBListGroup>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
				<MDBCol lg="5" className="mb-4">
					<MDBCard>
						<MDBCardBody>
							<MDBCardTitle><MDBIcon fas icon="shopping-basket" className="me-2" /> Compras Recientes en Cafetería</MDBCardTitle>
							<MDBListGroup>
								<MDBListGroupItem className="d-flex justify-content-between align-items-center">Sándwich de Jamón <MDBBadge color='success'>$35.00</MDBBadge></MDBListGroupItem>
								<MDBListGroupItem className="d-flex justify-content-between align-items-center">Jugo de Naranja <MDBBadge color='success'>$20.00</MDBBadge></MDBListGroupItem>
								<MDBListGroupItem className="d-flex justify-content-between align-items-center">Manzana <MDBBadge color='success'>$15.00</MDBBadge></MDBListGroupItem>
								<MDBListGroupItem className="d-flex justify-content-between align-items-center">Barra de Cereal <MDBBadge color='success'>$18.00</MDBBadge></MDBListGroupItem>
							</MDBListGroup>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

			<MDBRow>
				<MDBCol size="12">
					<MDBCard>
						<MDBCardBody>
							<MDBCardTitle><MDBIcon fas icon="history" className="me-2" /> Estado de Cuenta y Pagos</MDBCardTitle>
							<MDBTabs className='mb-3'>
								<MDBTabsItem><MDBTabsLink onClick={() => handleBasicClick('pendientes')} active={basicActive === 'pendientes'}>Pagos Pendientes</MDBTabsLink></MDBTabsItem>
								<MDBTabsItem><MDBTabsLink onClick={() => handleBasicClick('realizados')} active={basicActive === 'realizados'}>Pagos Realizados</MDBTabsLink></MDBTabsItem>
								<MDBTabsItem><MDBTabsLink onClick={() => handleBasicClick('colegiaturas')} active={basicActive === 'colegiaturas'}>Colegiaturas Pagadas</MDBTabsLink></MDBTabsItem>
							</MDBTabs>

							<MDBTabsContent>
								<MDBTabsPane show={basicActive === 'pendientes'}>
									<div className="table-responsive">
										<table className="table table-hover">
											<thead><tr><th>Concepto</th><th>Fecha Límite</th><th>Monto</th><th>Acción</th></tr></thead>
											<tbody>
												<tr><td>Colegiatura de Junio</td><td>10/06/2024</td><td>$1,500.00</td><td><MDBBtn size='sm'>Pagar ahora</MDBBtn></td></tr>
												<tr><td>Excursión Museo</td><td>05/06/2024</td><td>$350.00</td><td><MDBBtn size='sm'>Pagar ahora</MDBBtn></td></tr>
											</tbody>
										</table>
									</div>
								</MDBTabsPane>
								<MDBTabsPane show={basicActive === 'realizados'}>
										<div className="table-responsive">
										<table className="table">
												<thead><tr><th>Concepto</th><th>Fecha de Pago</th><th>Monto</th><th>Recibo</th></tr></thead>
												<tbody>
													<tr><td>Colegiatura de Mayo</td><td>08/05/2024</td><td>$1,500.00</td><td><MDBBtn size='sm' outline><MDBIcon fas icon="file-pdf" className="me-1"/> Ver</MDBBtn></td></tr>
													<tr><td>Material Didáctico</td><td>02/05/2024</td><td>$450.00</td><td><MDBBtn size='sm' outline><MDBIcon fas icon="file-pdf" className="me-1"/> Ver</MDBBtn></td></tr>
												</tbody>
										</table>
									</div>
								</MDBTabsPane>
								<MDBTabsPane show={basicActive === 'colegiaturas'}>
									<p>Aquí se mostraría un historial específico de todas las colegiaturas que han sido cubiertas a lo largo del ciclo escolar.</p>
								</MDBTabsPane>
							</MDBTabsContent>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>
			</div>
		</Layout>
	)
}