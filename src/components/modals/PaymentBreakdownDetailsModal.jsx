import React from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle,
  MDBModalBody, MDBModalFooter, MDBBtn, MDBCol, MDBTable, MDBTableHead, MDBTableBody
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LinkCell from '../common/LinkCell'; // Adjust import based on your structure

const PaymentRequestDetailsModal = ({
  isOpen,
  toggle,
  paymentBreakdownData,
  openPaymentDetailModal,
  navigateTo
}) => {
  const { t } = useTranslation();

  return (
    <MDBModal open={isOpen} onClose={toggle}>
      <MDBModalDialog size="lg">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{t('payments_breakdown')}</MDBModalTitle>
            <MDBBtn className='btn-close' color='none' onClick={toggle}></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            {paymentBreakdownData?.payments?.length > 0 ? (
              <MDBCol>
                <MDBCol className='d-flex align-items-center justify-content-between px-2 py-1 bg-info text-light'>
                  {paymentBreakdownData.payment_request_id && <MDBCol md="3" className='d-md-flex justify-content-center'>
                    {t("payment_request")}: #{paymentBreakdownData.payment_request_id}
                  </MDBCol>}
                  <MDBCol md="3" className='d-md-flex justify-content-center'>
                    {t("payment_month")}: {paymentBreakdownData.payment_month.replace(/_/g, '-')}
                  </MDBCol>
                  <MDBCol md="3" className='d-md-flex justify-content-center'>
                    {t("total_amount")}: ${Number(paymentBreakdownData.total_amount).toFixed(2)}
                  </MDBCol>
                  {paymentBreakdownData.payment_request_id && <MDBCol md="3" className='d-md-flex justify-content-end'>
                    <Link
                      to={typeof navigateTo === 'function' ? navigateTo(paymentBreakdownData) : navigateTo}
                      style={{ textDecoration: 'none' }}
                    >
                      <MDBBtn className='btn-secondary' >{t('go_to_details')}</MDBBtn>
                    </Link>
                  </MDBCol>}
                </MDBCol>

                <MDBTable striped small>
                  <MDBTableHead>
                    <tr>
                      <th>{t('payment_id')}</th>
                      <th>{t('date')}</th>
                      <th>{t('amount')}</th>
                      <th>{t('status')}</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {paymentBreakdownData.payments.map(p => (
                      <tr key={p.payment_id}>
                        <td>
                          <LinkCell
                            id={p.payment_id}
                            text={p.payment_id}
                            onClick={() => {
                              toggle();
                              openPaymentDetailModal(p.payment_id);
                            }}
                          />
                        </td>
                        <td>{p.created_at.replace(/_/g, '-')}</td>
                        <td>${Number(p.amount).toFixed(2)}</td>
                        <td>{p.payment_status_name}</td>
                      </tr>
                    ))}
                  </MDBTableBody>
                </MDBTable>
              </MDBCol>
            ) : (
              <p>{t('no_payments_found')}</p>
            )}
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color='secondary' onClick={toggle}>{t('close')}</MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default PaymentRequestDetailsModal;
