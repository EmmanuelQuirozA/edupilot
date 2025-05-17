// src/components/NoDataComponent.js
import React from 'react';
import { MDBIcon } from 'mdb-react-ui-kit';

const NoDataComponent = ({ message, body }) => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
      <MDBIcon far icon="frown" style={{ fontSize: '3rem', marginBottom: '1rem' }} />
      <h5>{message}</h5>
      <p>{body}</p>
    </div>
  );
};

export default NoDataComponent;
