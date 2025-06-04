import { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useReactToPrint } from 'react-to-print';
import swal from 'sweetalert';
import { useTranslation }        from 'react-i18next';
import { MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter } from 'mdb-react-ui-kit';
import usePaymentDetails from '../../hooks/usePaymentDetails';
import usePaymentLogs from '../../hooks/usePaymentLogs';
import { updatePaymentFields }        from '../../api/paymentsApi';

import Header from './Header';
import StudentInfo from './StudentInfo';
import PaymentInfo from './PaymentInfo';
import ReceiptCard from './ReceiptCard';
import LogsCard from './LogsCard';

import NoDataComponent from '../common/NoDataComponent';
import LoadingComponent from '../common/LoadingComponent';
import ErrorComponent from '../common/ErrorComponent';

export default function PaymentDetails({ id }) {
  const { t, i18n } = useTranslation();
  const { role } = useAuth() || {};

  // 1) fetch read-only data
  // Fetch payment
  const { data, loading, error, reload } = usePaymentDetails(id);
  // Fetch paymentRequest logs
  const { 
    logs, 
    // loading:logsLoading, 
    // error:logsError, 
    reload:logsReload 
  } = usePaymentLogs(id);
  
  // 2) keep a local, mutable copy for the form
  const [ editable, setEditable ] = useState(null);
  const [ isSaving, setIsSaving ] = useState(false);

  // whenever the fetched `data` arrives, seed our local copy:
  useEffect(() => {
    if (data) setEditable(data);
  }, [data]);
  

  // 3) onChange handler to pass down
  const handleChange = (key, value) => {
    setEditable(e => ({ ...e, [key]: value }));
  };

  // 4) onSave
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // pick only the fields you need, or send the whole `editable` if your API accepts it
      const {
        payment_concept_id,
        payment_through_id,
        payment_created_at,
        payment_month,
        amount
      } = editable;
      const payload = {
        payment_concept_id,
        payment_through_id,
        payment_created_at,
        payment_month,
        amount
      };

      const res = await updatePaymentFields(id, payload, i18n.language);
      swal(res.title, res.message, res.type);
      if (res.success !== false) {
        handleSuccess();
      }
    } catch {
      swal(t('error'),   t('failed_to_update_payment'), 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Print functionality
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: t('payment')+`-${id}`,
  });

  const handleSuccess = () => {
    reload();       // <— re-fetch the details
    logsReload();
  };

  if (loading) return <LoadingComponent />;
  if (!data || !editable)   return <NoDataComponent message={t("no_data_available")}  body={t("no_data_available_body")}/>;
  if (error)   return <ErrorComponent message={t('error')} body={t(error.message)} />;


  // Permissions
  const canEdit   = ['admin','school_admin'].includes(role?.toLowerCase()) && ![3,4].includes(data.payment_status_id);
  const canClose  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  const canPrint  = ['admin','school_admin','finance'].includes(role?.toLowerCase());
  
  // Logic statement to hide the gap 
  const isOpen = data.payment_status_id !== 3 && data.payment_status_id !== 4;
  const hasReceiptorlogs = Boolean(data.receipt_file_name || (Array.isArray(logs) && logs.length > 0) );
  return (
    <>
      <div className="d-none d-md-flex" style={{gap: (isOpen || hasReceiptorlogs) ? '1rem' : '0', alignItems: 'stretch'}}>
        <div ref={printRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? <LoadingComponent /> :
            <form id="validationForm" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <MDBCard className="mb-4 shadow-sm">
                <MDBCardHeader>
                  <Header 
                    data={editable} 
                    onPrint={handlePrint} 
                    canPrint={canPrint}
                    canClose={canClose}
                    onSuccess={handleSuccess}
                  />

                </MDBCardHeader>
                <MDBCardBody>
                  <StudentInfo data={editable} />
                  <PaymentInfo data={editable} onSuccess={handleSuccess} canEdit={canEdit} onChange={handleChange} />
                </MDBCardBody>

                <MDBCardFooter>
                {canEdit && (
                  <div className="text-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
                      {isSaving ? <span className="spinner-border spinner-border-sm" /> 
                        : t('save_changes')}
                    </button>
                  </div>
                )}
                </MDBCardFooter>
              </MDBCard>
            </form>
          }
        </div>

        <div style={{ maxWidth: '25%'}}>
          <ReceiptCard data={editable} onSuccess={handleSuccess} canEdit={canEdit} />
          <LogsCard data={logs} />
        </div>
      </div>
    </>
  );
}