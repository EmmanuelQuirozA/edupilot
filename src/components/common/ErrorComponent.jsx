// src/components/ErrorComponent.js
import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';

const ErrorComponent = ({ message, body }) => {
  return (
    <MDBContainer className="text-center py-5" style={{ minHeight: '80vh' }}>
      <MDBRow className="justify-content-center align-items-center">
        <MDBCol md="8">
          <MDBContainer style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '5px' }}>
            <MDBIcon far icon="dizzy" style={{ fontSize: '10rem',  color: '#ff6b6b', marginBottom: '1rem' }} />

            <h2 className="mb-4" style={{ fontWeight: '500' }}>
                {message}
            </h2>
            <p className="mb-4" style={{ fontSize: '1.2rem', color: '#6c757d' }}>
                {body}
            </p>
          </MDBContainer>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default ErrorComponent;
