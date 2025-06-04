// src/components/NoDataComponent.js
import React from 'react';
import { MDBCard,MDBContainer,MDBSpinner } from 'mdb-react-ui-kit';
import Layout from '../../layout/Layout';

const NoDataComponent = ({ message, body }) => {
  return (
      <div className="mb-3">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="my-5 text-center">
            <MDBSpinner grow color="primary" />
          </div>
        </div>
      </div>
  );
};

export default NoDataComponent;
