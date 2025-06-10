// src/components/PaymentHistoryCard.jsx
import React from 'react';
import {
  MDBAccordion,
  MDBAccordionItem,
  MDBListGroup,
  MDBListGroupItem,
  MDBBadge
} from 'mdb-react-ui-kit';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next'

export default function PaymentHistoryCard({ history,  tuitions=false  }) {
  const { i18n } = useTranslation();
  
  return (
    <MDBAccordion alwaysOpen initialActive={[]} >
      {history.map((yearBlock) => (
        <MDBAccordionItem
          className='card mb-2'
          key={yearBlock.year}
          collapseId={`year-${yearBlock.year}`}
          headerTitle={String(yearBlock.year)}
        >
          {yearBlock.months.map((monthBlock) => (
            <MDBAccordion
              alwaysOpen
              key={`nested-${yearBlock.year}-${monthBlock.month}`}
              initialActive={[]}
            >
              <MDBAccordionItem
                collapseId={`month-${yearBlock.year}-${monthBlock.month}`}
                headerTitle={
                  <div className="d-flex justify-content-between w-100">
                    <span>{formatDate("0"+monthBlock.month, i18n.language, { month: 'long' })}</span>
                    <MDBBadge light color="secondary">
                      ${monthBlock.total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </MDBBadge>
                  </div>
                }
              >
                <MDBListGroup>
                  {monthBlock.items.map((item) => (
                    <MDBListGroupItem
                      key={item.coffee_sale_id}
                      className="d-flex justify-content-between"
                    >
                      {!tuitions && (
                        <span>
                          {item.partConceptName} 
                        </span>
                      )}
                      
                      <span>${item.amount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                    </MDBListGroupItem>
                  ))}
                </MDBListGroup>
              </MDBAccordionItem>
            </MDBAccordion>
          ))}
        </MDBAccordionItem>
      ))}
    </MDBAccordion>
  );
}

PaymentHistoryCard.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      months: PropTypes.arrayOf(
        PropTypes.shape({
          month: PropTypes.number.isRequired,
          total: PropTypes.number.isRequired,
          items: PropTypes.arrayOf(
            PropTypes.shape({
              coffee_sale_id: PropTypes.number.isRequired,
              item_name:      PropTypes.string.isRequired,
              quantity:       PropTypes.number.isRequired,
              total:          PropTypes.number.isRequired,
            })
          ).isRequired
        })
      ).isRequired
    })
  ).isRequired,
  i18n: PropTypes.object.isRequired
};
