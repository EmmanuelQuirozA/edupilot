import React, { useState } from 'react';
import { MDBRow, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import LinkCell from '../../components/common/LinkCell';
import { formatDate } from '../../utils/formatDate';
import PaymentModal from '../../components/modals/PaymentModal'

export default function RequestHeader({ data, onApprove, onReject, canUpdate, onUpdated }) {
  const { breakdown, paymentInfo} = data;
  const { t } = useTranslation();

  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const openModal = id => {
    setSelectedPaymentId(id)
    setShowModal(true)
  }


  return (
    <>
      <MDBRow className="align-items-center">
        {/* <MDBIcon fas icon="file-invoice" className="me-2" /> */}
        <h6 className="text-uppercase text-muted small mb-3">{t('payments_breakdown')}</h6>
      </MDBRow>
      <div className="d-none d-md-flex mb-4">
        <MDBTable small style={{width:"100%"}}>
          <MDBTableHead light>
            <tr>
              <th>{t('payment_id')}</th>
              <th>{t('concept')}</th>
              <th>{t('status')}</th>
              <th>{t('date')}</th>
              <th className="text-end">{t('amount')}</th>
              <th className="text-end">{t('balance')}</th>
            </tr>
          </MDBTableHead>
          <MDBTableBody>

            {/* Payment rows */}
            {breakdown.map(p => (
              <tr key={p.date+"-"+p.balance}>
                <td>{p.payment_id? (<LinkCell id={p.payment_id} text={p.payment_id} onClick={() => {
                    openModal(p.payment_id);
                  }}/>): '-'}</td>
                <td>{t(p.type)}</td>
                <td>{p.status_name || '-'}</td>
                <td>{formatDate(p.date, {
                  year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
                })}</td>
                <td className="text-end" style={Number(p.amount)<=0?{color:"red"}:{color:"green"}}>{Number(p.amount) < 0 ? `-$${Math.abs(Number(p.amount)).toFixed(2)}` : `$${Number(p.amount).toFixed(2)}`}</td>
                <td className="text-end" style={Number(p.balance)<0?{color:"red"}:{color:"green"}}>{Number(p.balance) < 0 ? `-$${Math.abs(Number(p.balance)).toFixed(2)}` : `$${Number(p.balance).toFixed(2)}`}</td>
              </tr>
            ))}

            {/* Totals row */}
            <tr className="table-light fw-bold">
              <td colSpan="4" className="text-end">{t('total')}</td>
              {<td className="text-end" style= {(paymentInfo.pendingPayment)>0?{color:"red"}:{color:"green"}}>-${(paymentInfo.pendingPayment).toFixed(2)}</td>}
              <td></td>
            </tr>
          </MDBTableBody>
        </MDBTable>

        <PaymentModal
          paymentId={selectedPaymentId}
          show={showModal}
          setShow={setShowModal}
          canUpdate={canUpdate}
          onUpdated={onUpdated}
        />
      </div>
    </>
  );
}
