import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Translations
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <MDBContainer className="text-center py-5" style={{ minHeight: '80vh' }}>
      <MDBRow className="justify-content-center align-items-center">
        <MDBCol md="8">
          <MDBContainer style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '5px' }}>

                <h1
                    style={{
                    fontSize: '10rem',
                    fontWeight: 'bold',
                    color: '#ff6b6b',
                    marginBottom: '0.5rem',
                    }}
                >
                    404
                </h1>
                <h2 className="mb-4" style={{ fontWeight: '500' }}>
                    {t('page_not_found')}
                </h2>
                <p className="mb-4" style={{ fontSize: '1.2rem', color: '#6c757d' }}>
                    {t('page_not_found_body')}
                </p>
                <Link
                  to={`http://localhost:3000/dashboard`}
                  style={{ textDecoration: 'none' }}
                >
                  <MDBBtn color="info">
                    {t('back_to_home_btn')}
                  </MDBBtn>
                </Link>
          </MDBContainer>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default NotFoundPage;
