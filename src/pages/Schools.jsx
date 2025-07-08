import React, { useEffect, useState } from 'react';
import { MDBCard, MDBCardBody, MDBBtn, MDBRow, MDBCol, MDBCardImage, MDBIcon } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getSchools } from '../api/schoolsApi';
import Layout               from '../layout/Layout'
import NoDataComponent from '../components/common/NoDataComponent';
import ErrorComponent from '../components/common/ErrorComponent';
import LoadingComponent from '../components/common/LoadingComponent'
import api from '../api/api';

export default function Schools() {
  const { t, i18n } = useTranslation();
  const [schools, setSchools] = useState(null);
  const [logos, setLogos] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load logos in parallel
  const fetchLogo = async (school_id) => {
    try {
      const res = await api.get(`/api/school-logo/${school_id}`, {
        responseType: 'blob',
        validateStatus: status => status >= 200 && status < 300 || status === 204
      });

      if (res.status === 204 || res.data.size === 0) {
        return null; // No content = no logo
      }

      const blob = res.data;
      const url = URL.createObjectURL(blob);
      return url;
    } catch (err) {
      console.error(`Error loading logo for school ${school_id}:`, err);
      return null;
    }
  };

  useEffect(() => {
    setLoading(true);
    getSchools(i18n.language, 1)
      .then(async (res) => {
        setSchools(res);
        const logoMap = {};

        await Promise.all(res.map(async (s) => {
          const logoUrl = await fetchLogo(s.school_id);
          logoMap[s.school_id] = logoUrl;
        }));

        setLogos(logoMap);
      })
      .catch(err => {
        console.error('Error loading schools:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [i18n.language]);

  if (loading) return <Layout pageTitle={t('schools')}><LoadingComponent /></Layout>;
  if (error) return <Layout pageTitle={t('schools')}><ErrorComponent message={t('error')} body={t(error.message)} /></Layout>;
  if (!schools || schools.length === 0) return <Layout pageTitle={t('schools')}><NoDataComponent message={t("no_data_available")} body={t("no_data_available_body")} /></Layout>;

  return (
    <Layout pageTitle={t('schools')}>
      <MDBRow  className="justify-content-center g-4">
          {schools.map(school => (
            <MDBCol key={school.school_id} lg="4" md="6">
              <MDBCard className="text-center shadow-sm h-100 p-3">
                {logos[school.school_id] ? (
                  <MDBCardImage
                    src={logos[school.school_id]}
                    alt="Logo"
                    position="top"
                    style={{ height: '120px', objectFit: 'contain', marginBottom: '1rem' }}
                  />
                ) : (
                  
                  <MDBCardImage
                    src={'img/coffee/placeholder.jpg'}
                    alt="Logo"
                    position="top"
                    style={{ height: '120px', objectFit: 'contain', marginBottom: '1rem'}}
                  />
                )}

                <MDBCardBody>
                  <h5 className="fw-bold">{school.commercial_name}</h5>
                  <p className="text-muted mb-4">
                    {school.street} {school.ext_number || ''} {school.int_number && `Int. ${school.int_number}`}<br />
                    {school.suburb} {school.suburb && ','} {school.municipality} {school.municipality && ','} {school.state}
                  </p>
                  <MDBBtn outline onClick={() => navigate(`/schools/${school.school_id}`)}>
                    <MDBIcon fas icon="pen" className="me-1" /> {t('edit')}
                  </MDBBtn>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}
      </MDBRow>
    </Layout>
  );
}
