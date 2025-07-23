// src/components/PaymentRequestCard.jsx
import React from 'react';
import {
  MDBAccordion,
  MDBAccordionItem,
  MDBBadge,
  MDBRow,
  MDBCol
} from 'mdb-react-ui-kit';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next'

export default function PaymentRequestCard({ data  }) {
  const { i18n,t } = useTranslation();
  const today   = new Date();

  // zero‐out the times so you’re only comparing dates:
  today.setHours(0,0,0,0);
  
  return (
    <MDBAccordion alwaysOpen initialActive={[]} >
      {data.map((r) => (
        <MDBAccordion
          alwaysOpen
          key={`nested-${r.year}-${r.month}`}
          initialActive={[]}
        >
          <MDBAccordionItem
            className='card mb-2'
            key={r.paymentRequestId}
            collapseId={`month-${r.year}-${r.month}`}
            headerTitle={
              <div >
                <MDBCol ><span>{r.ptName}{r.paymentMonth && (' - ' + formatDate(r.paymentMonth, i18n.language, { month: 'long' }))} </span></MDBCol>
                <MDBCol>
                  <MDBBadge light color={new Date(r.prPayBy).setHours(0,0,0,0) < today ? 'danger' : 'secondary'}>
                    {new Date(r.prPayBy).setHours(0,0,0,0) < today ? (t('expired_date')):(t('pay_by'))} {formatDate(r.prPayBy, i18n.language, { month: 'short', day: '2-digit' })}
                  </MDBBadge>
                </MDBCol>
              </div>
            }
          >
            <MDBRow
              className="d-flex justify-content-between"
            >
              <MDBCol>
                <span className='text-muted small'>
                  ${r.prAmount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  {r.lateFeeTotal && (' + $'+r.lateFeeTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+" "+t('late_fee'))}
                </span>
              </MDBCol>
              <MDBCol>
              <span className=' small d-flex justify-content-end'>
                {t('total')+": $"+(r.prAmount+r.lateFeeTotal).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
              </MDBCol>
            </MDBRow>

          </MDBAccordionItem>
        </MDBAccordion>
      ))}
    </MDBAccordion>
  );
}

PaymentRequestCard.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      months: PropTypes.arrayOf(
        PropTypes.shape({
          month: PropTypes.number.isRequired,
          total: PropTypes.number.isRequired
        })
      ).isRequired
    })
  ).isRequired,
  i18n: PropTypes.object.isRequired
};
