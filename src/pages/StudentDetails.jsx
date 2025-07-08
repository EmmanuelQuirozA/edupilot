import React, { useState, useEffect }  from 'react';
import { useParams }        from 'react-router-dom';
import { useTranslation }   from 'react-i18next';
import { useAuth } 							 from '../context/AuthContext';
import Layout               from '../layout/Layout'
import PaymentsTable             from '../components/tables/PaymentsTable'
import MonthlyPaymentsTable             from '../components/tables/MonthlyPaymentsTable'
import BalanceRechargesTable     from '../components/tables/BalanceRechargesTable'
import {
  MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody,
  MDBSpinner, MDBIcon, MDBInput, MDBBtn
} from 'mdb-react-ui-kit';
import NoDataComponent from '../components/common/NoDataComponent';
import api from '../api/api';
import ErrorComponent from '../components/common/ErrorComponent';
import LoadingComponent from '../components/common/LoadingComponent'
// import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
// import QuickActions           from '../components/QuickActions/QuickActions';

export default function StudentDetailPage() {
  const { studentId } = useParams();
  const { user, role } = useAuth() || {};
  const { t,i18n } = useTranslation();
  const [student, setStudent] = useState(null);;
  const [error, setError] = useState(null);;
  const [loading, setLoading] = useState(true);
  
  // Permissions
  const canRegisterPayment = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canAddBalance     = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canExport         = ['admin','school_admin','finance','student'].includes(role?.toLowerCase());
  const canViewReport     = ['admin','school_admin','finance','student'].includes(role?.toLowerCase());
  const canViewPayments   = ['admin','school_admin','finance','student'].includes(role?.toLowerCase());
  const canViewRecharges  = ['admin','school_admin','finance','student'].includes(role?.toLowerCase());

  const features = {
    canRegisterPayment,
    canAddBalance,
    canExport,
    canViewReport,
    canViewPayments,
    canViewRecharges
  };

  // Fetch student details
  useEffect(() => {
    if (!studentId) return;

    setLoading(true);
    setError(false); // Reset error before new request

    api.get(`/api/students/student-details/${studentId}`)
      .then(res => {
        setStudent(res.data[0]);
      })
      .catch(err => {
        console.error('Error loading student details:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [studentId, i18n.language]);


  // Modal state for "Register Payment"
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const toggleRegisterModal = () => setRegisterModalOpen(v => !v);
  // Modal state for "Add Balance"
  const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
  const toggleBalanceModal = () => setBalanceModalOpen(v => !v);



  // Style for each group
	const groupStyle = {
		borderBottom: '1px solid rgb(228 228 228)',
		marginBottom: '15px'
	};

  if (loading) return <Layout pageTitle={t('student_details')}><LoadingComponent /> </Layout>;
  if (error)   return <Layout pageTitle={t('student_details')}><ErrorComponent message={t('error')} body={t(error.message)} /></Layout>;
  if (!student) return <Layout pageTitle={t('student_details')}><NoDataComponent message={t("no_data_available")}  body={t("no_data_available_body")}/></Layout>;

  return (
    <Layout pageTitle={t('student_details')}>

      {/* Quick Actions: register payment or add balance */}
      {/* {(features.canRegisterPayment || features.canAddBalance) && (
        <QuickActions
          showRegisterPayment={features.canRegisterPayment}
          showAddBalance={features.canAddBalance}
          onRegisterPayment={toggleRegisterModal}
          onAddBalance={toggleBalanceModal}
          columns='2'
        />
      )} */}

			{/* Student Details */}
      <MDBRow className="mb-3">
				<MDBCol md="12">
					<MDBCard className="shadow-sm">
						<MDBCardHeader className="d-flex justify-content-between align-items-center position-relative">
							<MDBCol className="d-flex align-items-center">
								<MDBIcon fas icon="user" className="me-2" />
								<h4 className="mb-0">{student.student_id+" - "+student.full_name}</h4> 
							</MDBCol>
							<p
								className="p"
								style={
									Number(student.balance) < 0
										? { padding: '5px', margin:'0px', textAlign: 'center', borderRadius: '4px', backgroundColor: 'red', color: 'white' }
										: {padding: '5px', margin:'0px', textAlign: 'center'}
								}
							>
								<strong>{t("balance")}:</strong> {student.balance}
							</p>
						</MDBCardHeader>
						<MDBCardBody>
							<div style={groupStyle}>
								<MDBRow>
										
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("payment_reference")}:</p>
											<strong>{student.payment_reference || "N/A"}</strong>
										</div>
									</MDBCol>
										
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("tuition")}:</p>
											<strong>{student.tuition || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
							</div>
							<div style={groupStyle}>
								<MDBRow>
										
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("school")}:</p>
											<strong>{student.commercial_name || "N/A"}</strong>
										</div>
									</MDBCol>
										
										<MDBCol md="6">
											<div className="mb-2">
												<p className='mb-0'>{t("default_tuition")}:</p>
												<strong>{student.default_tuition || "N/A"}</strong>
											</div>
										</MDBCol>

								</MDBRow>
							</div>
							<div style={groupStyle}>
								<MDBRow>
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("generation")}:</p>
											<strong>{student.generation || "N/A"}</strong>
										</div>
									</MDBCol>
									
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("grade_group")}:</p>
											<strong>{student.grade_group || "N/A"}</strong>
										</div>
									</MDBCol>
									
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("scholar_level_name")}:</p>
											<strong>{student.scholar_level_name || "N/A"}</strong>
										</div>
									</MDBCol>

									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("joining_date")}:</p>
											<strong>{student.joining_date || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
							</div>
							<div style={groupStyle}>
								<MDBRow>
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("email")}:</p>
											<strong>{student.email || "N/A"}</strong>
										</div>
									</MDBCol>
									
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("username")}:</p>
											<strong>{student.username || "N/A"}</strong>
										</div>
									</MDBCol>
										
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("phone_number")}:</p>
											<strong>{student.phone_number || "N/A"}</strong>
										</div>
									</MDBCol>
									<MDBCol md="3">
										<div className="mb-2">
											<p className='mb-0'>{t("address")}:</p>
											<strong>{student.address || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
										
								<MDBRow>
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("user_status")}:</p>
											<strong>{student.user_status || "N/A"}</strong>
										</div>
									</MDBCol>
									<MDBCol md="6">
										<div className="mb-2">
											<p className='mb-0'>{t("group_status")}:</p>
											<strong>{student.group_status || "N/A"}</strong>
										</div>
									</MDBCol>
								</MDBRow>
							</div>
						</MDBCardBody>
					</MDBCard>
				</MDBCol>
			</MDBRow>

      {/* Monthly Payments Report */}
      {features.canViewReport && (
          <MonthlyPaymentsTable
            studentId={student?.student_id}
            canExport={canExport}
						canSeeDebtOnlyBtn={false}
						canSeeHeaderActions={false}
          />
      )}
			<MDBRow>
				<MDBCol md={6}>
					<PaymentsTable
						fullList={false}
						studentId={student?.student_id}
						canExport={canExport}
					/>
				</MDBCol>
				<MDBCol md={6}>
					{/* Balance Recharges */}
					{features.canViewRecharges && (
						<>
							{/* Balance Recharges */}
							<BalanceRechargesTable
								fullList={false}
								user_id={student?.user_id}
								canExport={canExport}
							/>
						</>
					)}
				</MDBCol>

			</MDBRow>
      
      {/* ------- Payments Report ------- */}
      

      {/* {features.canViewPayments && (
        <PaymentsList
          studentId={studentId}
          canAdd={features.canRegisterPayment}
          canExport={features.canExport}
          onRowClick={openPaymentDetail}
        />
      )} */}

      {/* Register Payment Modal */}
      {/* <FormModal
        open={isRegisterModalOpen}
        onClose={toggleRegisterModal}
        title={t('register_payment')}
        // formGroups and onSave to be implemented
      /> */}

      {/* Add Balance Modal */}
      {/* <FormModal
        open={isBalanceModalOpen}
        onClose={toggleBalanceModal}
        title={t('add_balance')}
        // formGroups and onSave to be implemented
      /> */}

    </Layout>
  );
}
