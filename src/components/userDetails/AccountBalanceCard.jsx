// src/components/AccountBalanceCard.jsx
import React, { useEffect, useState } from 'react';
import {
  MDBAccordion,
  MDBAccordionItem,
  MDBBadge,
  MDBRow,
  MDBCol,
  MDBListGroup,
  MDBListGroupItem,
  MDBIcon
} from 'mdb-react-ui-kit';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next';
import { getAccountBalanceGrouped } from '../../api/balanceApi';

export default function AccountBalanceCard(user_id) {
  const { i18n, t } = useTranslation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccountBalanceGrouped({
        user_id,
        lang: i18n.language})
      .then(setData)
      .catch(err => console.error('Error loading account balance:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t('loading')}...</p>;

  return (
    <MDBAccordion alwaysOpen initialActive={[]}>
      {data.map((yearBlock) => (
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
                  </div>
                }
              >
                <MDBListGroup className='p-0'>
                  {monthBlock.days.map((dayBlock) => (
                    <MDBListGroup className='mb-2 p-0'>
                      <div className='fw-bold'>
                        {dayBlock.day} 
                        {/* - 
                        {new Date(2020, parseInt(monthBlock.month) - 1).toLocaleDateString(i18n.language, { month: 'short' })} */}
                      </div>
                      {dayBlock.items.map((item) => (
                        <MDBListGroupItem
                          key={item.sale+item.createdAt}
                          className='p-0 border-0'
                        >
                          <MDBRow>
                            <small className='d-flex justify-content-between align-items-center'>
                              <div>{item.concept} </div> 
                              <div className={item.sale==='0'?'text-success':'text-danger'} >{item.sale==='0'?'':'-'} ${item.amount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                            </small>
                          </MDBRow>
                        </MDBListGroupItem>
                      ))}
                    </MDBListGroup>
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
