import React, { useState,useEffect } from 'react';
import { MDBRow, MDBCol, MDBInput } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatDate';
import useCatalog from '../../hooks/useCatalogOptions';

export default function RequestHeader({ 
  data, 
  onSuccess,
  canEdit, 
  onChange   // callback: (fieldName, newValue) => void
}) {
  const { t, i18n } = useTranslation();

  // local state for controlled selects
  const [conceptId, setConceptId] = useState(data.payment_concept_id || '');
  const [throughId, setThroughId] = useState(data.payment_through_id  || '');
  
  // a flag so we only fire fetchData once
  const [loaded, setLoaded] = useState(false);

  // Fetch catalogs
  const { data: paymentConcepts, fetchData: loadPaymentConcepts } = useCatalog('paymentConcepts');
  const { data: paymentThrough,  fetchData: loadPaymentThrough  } = useCatalog('paymentThrough');


  // 1) fetch catalogs only once when we first flip into edit mode
  useEffect(() => {
    if (canEdit && !loaded) {
      loadPaymentConcepts();
      loadPaymentThrough();
      setLoaded(true);
    }
  }, [canEdit, loaded, loadPaymentConcepts, loadPaymentThrough]);

  // 2) sync local state if parent data changes
  useEffect(() => {
    setConceptId(data.payment_concept_id || '');
    setThroughId(data.payment_through_id  || '');
  }, [data.payment_concept_id, data.payment_through_id]);


  const handleConceptChange = e => {
    const v = e.target.value;
    setConceptId(v);
    onChange('payment_concept_id', v ? Number(v) : null);
  };
  const handleThroughChange = e => {
    const v = e.target.value;
    setThroughId(v);
    onChange('payment_through_id', v ? Number(v) : null);
  };


  function KeyValue({ label, type, value, icon: Icon }) {
    return (
      <MDBCol md="4">
        <p className="mb-0 text-muted">{t(label)}:</p>
        <strong>{ value? value:t("not_available") }</strong>
      </MDBCol>
    );
  }

  if (!canEdit) {
    return (
      <>
        <MDBRow className="d-flex justify-content-between align-items-center pb-2">
          <MDBCol>
            <h6 className="text-uppercase text-muted small ">{t('payment_details')}</h6>
          </MDBCol>
          <MDBCol className="d-flex justify-content-end gap-2">
            <strong
              className={`px-2 py-1 rounded ${
                data.payment_status_id === 3
                  ? "bg-success text-white" :
                  data.payment_status_id === 4
                  ? "bg-warning text-white"
                  : "bg-secondary text-white"
              }`}
              style={{ display: "inline-block" }}
            >
              <h5 className="text-white my-0">{data.payment_status_name}</h5>
            </strong>
          </MDBCol>
        </MDBRow>
        <MDBRow className="mb-2">
          <KeyValue label={t("payment_type")}        value={data.payt_name}   />
          <KeyValue label={t("payment_concept")}     value={data.pt_name}     />
          <KeyValue label={t("created_on")}          value={
            new Intl.DateTimeFormat(i18n.language, { 
              year:'numeric',month:'long',day:'2-digit',
              hour:'2-digit',minute:'2-digit'
            }).format(new Date(data.payment_created_at))
          }/>
          <KeyValue label={t("payment_month")}       value={
            new Intl.DateTimeFormat(i18n.language, { year:'numeric',month:'long' })
              .format(new Date(data.payment_month))
          }/>
          <KeyValue label={t("amount")}              value={`$${data.amount.toFixed(2)}`} />
        </MDBRow>
      </>
    );
  }

  return (
    <>
      <MDBRow className="d-flex justify-content-between align-items-center pb-2">
        <MDBCol>
          <h6 className="text-uppercase text-muted small ">{t('payment_details')}</h6>
        </MDBCol>
        <MDBCol className="d-flex justify-content-end gap-2">
          <strong
            className={`px-2 py-1 rounded ${
              data.payment_status_id === 3
                ? "bg-success text-white" :
                data.payment_status_id === 4
                ? "bg-warning text-white"
                : "bg-secondary text-white"
            }`}
            style={{ display: "inline-block" }}
          >
            <h5 className="text-white my-0">{data.payment_status_name}</h5>
          </strong>
        </MDBCol>
      </MDBRow>
      <MDBRow className="mb-2">
        <MDBCol md="4">
          <MDBInput
            label={t("created_at")}
            type="datetime-local"
            id="payment_created_at"
            value={data.payment_created_at || ''}
            onChange={e => onChange('payment_created_at', e.target.value)}
          />
        </MDBCol>

        <MDBCol md="4">
          <MDBInput
            label={t("payment_month")}
            type="month"
            id="payment_month"
            value={data.payment_month?.slice(0,7) || ''}
            onChange={e => onChange('payment_month', e.target.value)}
          />
        </MDBCol>

        <MDBCol md="4">
          <MDBInput
            label={t("amount")}
            type="number"
            id="amount"
            value={data.amount || ''}
            onChange={e => onChange('amount', e.target.value)}
            step="0.01"
          />
        </MDBCol>
      </MDBRow>

      <MDBRow>
        <MDBCol md="6">
          <label className="form-label">{t("payment_type")}</label>
          <select
            className="form-select"
            id="paymentThrough"
            value={throughId}
            onChange={handleThroughChange}
          >
            <option value="">{`— ${t('select_option')} —`}</option>
            {paymentThrough?.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </MDBCol>

        <MDBCol md="6">
          <label className="form-label">{t("payment_concept")}</label>
          <select
            className="form-select"
            id="paymentConcept"
            value={conceptId}
            onChange={handleConceptChange}
          >
            <option value="">{`— ${t('select_option')} —`}</option>
            {paymentConcepts?.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </MDBCol>
      </MDBRow>
    </>
  );
}
