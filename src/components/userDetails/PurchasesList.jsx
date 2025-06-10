import React, { useState } from 'react';
import {
  MDBListGroup,
  MDBListGroupItem,
  MDBBadge,
  MDBIcon
} from 'mdb-react-ui-kit';
import { formatDate } from '../../utils/formatDate'; // your formatter

export default function PurchasesList({ myPurchases, i18n }) {
  // Track which sale IDs are currently expanded
  const [expandedSales, setExpandedSales] = useState(new Set());

  const toggle = (saleId) => {
    setExpandedSales(prev => {
      const next = new Set(prev);
      if (next.has(saleId)) next.delete(saleId);
      else next.add(saleId);
      return next;
    });
  };

  return (
    <MDBListGroup>
      {myPurchases.map(sale => {
        const isOpen = expandedSales.has(sale.sale);
        return (
          <React.Fragment key={sale.sale}>
            <MDBListGroupItem
              className="d-flex justify-content-between align-items-center border-0"
              style={{ cursor: 'pointer' }}
              onClick={() => toggle(sale.sale)}
            >
              <div className="d-flex align-items-center">
                <MDBIcon
                  fas
                  icon={isOpen ? 'chevron-down' : 'chevron-right'}
                  className="me-2"
                />
                <small className="text-muted">
                  {formatDate(
                    sale.created_at,
                    i18n.language,
                    { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }
                  )}
                </small>
              </div>
              <MDBBadge color="success">
                ${sale.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </MDBBadge>
            </MDBListGroupItem>

            <div className={`ps-4 pe-4 sale-details ${isOpen ? 'open' : ''}`} style={{ backgroundColor: '#f8f9fa' }}>
              <MDBListGroup flush>
                  {sale.items.map(item => (
                    <MDBListGroupItem key={item.coffee_sale_id} className="d-flex justify-content-between">
                      <span>
                        {item.quantity} × {item.item_name}
                      </span>
                      <span>
                        ${item.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </span>
                    </MDBListGroupItem>
                  ))}
                </MDBListGroup>
              </div>
          </React.Fragment>
        );
      })}
    </MDBListGroup>
  );
}
