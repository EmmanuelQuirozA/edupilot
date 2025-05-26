import React from 'react';
import { MDBIcon } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { MDBCard, MDBCardHeader, MDBCardBody, MDBCol } from 'mdb-react-ui-kit';
import { formatDate } from '../../utils/formatDate';

export default function RequestSettings({ data }) {
  const { t,i18n } = useTranslation();

  return (
    <>
      {Array.isArray(data) && data.length > 0 && (
        <MDBCard  className="shadow-sm border-0 mb-3">
          <MDBCardHeader className="bg-white d-flex justify-content-between align-items-center border-bottom">
            <div className="d-flex align-items-center">
              <MDBIcon fas icon="undo" className="me-2" />
              <h4 className="mb-0">{t("change_log")}</h4> 
            </div>
          </MDBCardHeader>
          <MDBCardBody
            style={{ maxHeight: '50vh', overflowY: 'auto' }}
          >
            {data.map((log) => (
              <MDBCol key={log.updated_at} className="mb-0">
                <small key={log.payment_request_id} className="text-muted">
                  {formatDate(log.updated_at, i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </small>
                <p className="fw-bold mb-0" style={{marginTop:'-7px'}}>{log.responsable_full_name}</p>
                <p className="mb-0" style={{marginTop:'-7px'}}>{log.log_type_name}:</p>
                {log.changes.map((change) => {
                  const field = change.field;
                  const oldVal = change.from;
                  const newVal = change.to;
                  const isDate = ['pay_by', 'payment_month'].includes(field);
                  const isBoolean = field === 'partial_payment';

                  const renderValue = (val) => {
                    if (isBoolean) return val === '1' ? t('yes') : t('no');
                    if (isDate && field === 'payment_month') return formatDate(val, i18n.language, { year: 'numeric', month: 'long' });
                    if (isDate)
                      return formatDate(val, i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                      if (field === 'amount')
                        return("$"+val);
                    return val;
                  };

                  return (
                    <div key={change.updated_at} className="mb-1">
                      <strong>{t(field)}:</strong>
                      <div className="position-relative ms-3">
                        <div
                          style={{
                            position: 'absolute',
                            left: '6px',
                            top: '10px',
                            bottom: '35%',
                            width: '2px',
                            backgroundColor: '#0d6efd',
                          }}
                        />
                        <div style={{ paddingLeft: '16px' }}>
                          <div style={{ lineHeight: '1.2' }}>
                            <span className="text-muted">{t('from')}: {renderValue(oldVal)}</span> 
                          </div>
                          <div style={{ position: 'relative', lineHeight: '1.2' }}>
                            <span className="fw-bold">{t('to')}: {renderValue(newVal)}</span> 
                            <span
                              style={{
                                position: 'absolute',
                                left: '-13px',
                                top: '5px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#0d6efd',
                                borderRadius: '50%',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </MDBCol>
            ))}
          </MDBCardBody>
        </MDBCard>
      )}
    </>
  );
}