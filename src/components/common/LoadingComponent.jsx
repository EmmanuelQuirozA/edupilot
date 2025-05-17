// src/components/NoDataComponent.js
import React from 'react';
import { MDBCard,MDBContainer,MDBSpinner } from 'mdb-react-ui-kit';

const NoDataComponent = ({ message, body }) => {
  return (
    <MDBCard className="shadow-sm border-0 mb-3">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight:'80vh'}}>
        <MDBContainer className="my-5 text-center">
          <MDBSpinner grow color="primary" />
        </MDBContainer>
      </div>
    </MDBCard>
  );
};

export default NoDataComponent;
