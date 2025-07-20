// src/components/PaymentHistoryCard.jsx
import React, { useState } from 'react';
import {
  MDBAccordion,
  MDBAccordionItem,
  MDBListGroup,
  MDBListGroupItem,
  MDBBadge,
  MDBBtn,
  MDBIcon
} from 'mdb-react-ui-kit';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next'
import ProtectedFileModal from '../modals/ProtectedFileModal';

export default function PaymentHistoryCard({ history,  tuitions=false  }) {
  const { i18n,t } = useTranslation();
    
    
    const [showFileModal, setShowFileModal] = useState(false);
    const [modalFilename, setModalFilename] = useState('');
    const [modalFilepath, setModalFilepath] = useState('');
  
  return (
    <>
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
              className='border-0 p-0'
            >
              <MDBAccordionItem
                className='card mb-2'
                collapseId={`month-${yearBlock.year}-${monthBlock.month}`}
                headerTitle={
                  <div className="d-flex justify-content-between w-100">
                    {/* <span>{formatDate("0"+monthBlock.month, i18n.language, { month: 'long' })}</span> */}
                    {new Date(2020, parseInt(monthBlock.month) - 1).toLocaleDateString(i18n.language, { month: 'long' })}
                    <MDBBadge light color="secondary">
                      ${monthBlock.total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </MDBBadge>
                  </div>
                }
              >
                <MDBListGroup className='p-0'>
                  {monthBlock.items.map((item) => (
                    <MDBListGroupItem
                      key={item.paymentId}
                      className='p-0 my-2 border-0'
                    >
                      {!tuitions ? (
                        <span>
                          {item.partConceptName} 
                        </span>
                      ):(
                        <span>
                          {formatDate(item.paymentCreatedAt, i18n.language, { year: 'numeric', month: 'long', day: '2-digit' })} 
                        </span>
                      )}
                      <br/>
                      <span>${item.amount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                      <br/>
                      {item.receiptFileName && (<MDBBtn className='w-100' outline size="sm"
                        onClick={() => {
                          setModalFilename(item.receiptFileName);
                          setModalFilepath(item.receiptPath);
                          setShowFileModal(true);
                        }}
                      >
                        <MDBIcon fas icon="file-pdf" className="me-1"/> Ver
                      </MDBBtn>)}
                    </MDBListGroupItem>
                  ))}
                </MDBListGroup>
              </MDBAccordionItem>
            </MDBAccordion>
          ))}
        </MDBAccordionItem>
      ))}
    </MDBAccordion>
  
    <ProtectedFileModal
      filename={modalFilename}
      filepath={modalFilepath}
      show={showFileModal}
      onClose={() => setShowFileModal(false)}
      lang={i18n.language}
    />
    </>
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
              paymentId: PropTypes.number.isRequired,
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
