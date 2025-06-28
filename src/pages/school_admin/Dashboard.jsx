import React, { useState } from 'react'
import Layout from '../../layout/Layout'
import { useTranslation } from 'react-i18next'
import { MDBBtn, MDBCard, MDBCardBody, MDBCol, MDBContainer, MDBIcon, MDBRow } from 'mdb-react-ui-kit';
import InfoCard from '../../components/common/InfoCard'
import CreatePaymentModal from '../../components/payment/modals/CreatePaymentModal';
import CreatePaymentRequestModal from '../../components/paymentRequest/modals/CreatePaymentRequestModal';
import CreateUserModal from '../../components/users/modals/CreateUserModal';
import CreateStudentModal from '../../components/students/modals/CreateStudentModal';
import CreateBalanceModal from '../../components/balanceRecharges/modals/CreateBalanceModal';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [showCreatePaymentModal, setCreatePaymentShowModal] = useState(false);
  const [showCreatePaymentRequestModal, setCreatePaymentRequestShowModal] = useState(false);
  const [showCreateUserModal, setCreateUserShowModal] = useState(false);
  const [showCreateStudentModal, setCreateStudentShowModal] = useState(false);
  const [showCreateBalanceModal, setCreateBalanceShowModal] = useState(false);
  
  const onSuccess = () => {
    // reload();
  };

  return (
    <Layout pageTitle={t('school_admin_portal')}>
      <section className="home-section">
        <div fluid className="mb-4">
          <MDBRow>
            <MDBCol md="4">
              <InfoCard
                title="Estudiantes"
                icon="users"
                borderColor="#008cf5"     // Yellow
                iconColor="#008cf5"
                counts={[
                  { value: 57, label: 'Activos' },
                  { value: 9, label: 'Egresados' },
                  { value: 2000, label: 'Licencias' }
                ]}
              />
            </MDBCol>
            <MDBCol md="4">
            <InfoCard
              title="Eventos"
              icon="calendar-alt"
              borderColor="#f5b700"     // Yellow
              iconColor="#f5b700"
              counts={[
                { value: 13, label: 'Próximos' }
              ]}
            />
            </MDBCol>
            <MDBCol md="4">
            <InfoCard
              title="Nuevos ingresos"
              icon="file-signature"
              borderColor="#33f500"     // Yellow
              iconColor="#33f500"
              counts={[
                { value: 57, label: 'Pre-admisión' },
                { value: 9, label: 'En proceso' }
              ]}
            />
            </MDBCol>
          </MDBRow>
        </div>

        <MDBCard className="shadow-sm mb-4">
          <MDBCardBody>
            <h5 className="mb-4 fw-bold">
              <MDBIcon icon="bolt" className="me-2 text-primary" />
              Accesos Rápidos
            </h5>
            <MDBRow className="g-3">
              <MDBCol md="6" lg="4">
                <MDBBtn
                  color="light"
                  className="w-100"
                  size="lg"
                  onClick={() => setCreatePaymentRequestShowModal(true)}
                >
                  <MDBIcon icon="file-invoice-dollar" className="me-2" />
                  Crear Solicitud de Pago
                </MDBBtn>
              </MDBCol>

              <MDBCol md="6" lg="4">
                <MDBBtn
                  color="light"
                  className="w-100"
                  size="lg"
                  onClick={() => setCreateBalanceShowModal(true)}
                >
          
                  <MDBIcon icon="money-bill-wave" className="me-2" />
                  Recarga de Saldo
                </MDBBtn>
              </MDBCol>

              <MDBCol md="6" lg="4">
                <MDBBtn
                  color="light"
                  className="w-100"
                  size="lg"
                  onClick={() => setCreatePaymentShowModal(true)}
                >
                  <MDBIcon icon="cash-register" className="me-2" />
                  Registrar Pago
                </MDBBtn>
              </MDBCol>

              <MDBCol md="6" lg="4">
                <MDBBtn
                  color="light"
                  className="w-100 text-dark"
                  size="lg"
                  onClick={() => setCreateUserShowModal(true)}
                >
                  <MDBIcon icon="user-plus" className="me-2" />
                  Registrar Usuario
                </MDBBtn>
              </MDBCol>

              <MDBCol md="6" lg="4">
                <MDBBtn
                  color="light"
                  className="w-100"
                  size="lg"
                  onClick={() => setCreateStudentShowModal(true)}
                >
                  <MDBIcon icon="graduation-cap" className="me-2" />
                  Registrar Estudiante
                </MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBCardBody>
        </MDBCard>
      </section>

      {/* Modals */}
      <CreatePaymentModal show={showCreatePaymentModal} setShow={setCreatePaymentShowModal} onSuccess={onSuccess} />
      <CreatePaymentRequestModal show={showCreatePaymentRequestModal} setShow={setCreatePaymentRequestShowModal} onSuccess={onSuccess} />
      <CreateUserModal show={showCreateUserModal} setShow={setCreateUserShowModal} onSuccess={onSuccess} />
      <CreateStudentModal show={showCreateStudentModal} setShow={setCreateStudentShowModal} onSuccess={onSuccess} />
      <CreateBalanceModal show={showCreateBalanceModal} setShow={setCreateBalanceShowModal} onSuccess={onSuccess} />
      
    </Layout>
  )
}