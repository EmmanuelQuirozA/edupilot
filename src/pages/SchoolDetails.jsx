import React, { useState, useEffect } from 'react';
import { useParams }        from 'react-router-dom';
import { MDBRow, MDBCol, MDBInput, MDBCard, MDBCardBody, MDBCardTitle, MDBBtn, MDBCardImage } from 'mdb-react-ui-kit';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { getSchools } from '../api/schoolsApi';
import { useTranslation }   from 'react-i18next';
import Layout from '../layout/Layout';
import NoDataComponent from '../components/common/NoDataComponent';
import ErrorComponent from '../components/common/ErrorComponent';
import LoadingComponent from '../components/common/LoadingComponent'
import swal from 'sweetalert';

export default function SchoolDetails() {
  const { t,i18n } = useTranslation();
  const { role } = useAuth();
  const [formData, setFormData] = useState({});
  const [logo, setLogo] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { school_id } = useParams();

  const MAX_FILE_SIZE = 1048576; // 1 MB


  const canEdit = ['admin', 'school_admin'].includes(role?.toLowerCase());


  // Load logo in parallel
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
    getSchools(i18n.language, 1, school_id)
      .then(async (res) => {
        setFormData(res[0]);
        const logoMap = {};

        await Promise.all(res.map(async (s) => {
          const logoUrl = await fetchLogo(s.school_id);
          logoMap[s.school_id] = logoUrl;
        }));

        setLogo(logoMap);
      })
      .catch(err => {
        console.error('Error loading schools:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [i18n.language]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = new FormData();
    payload.append('request', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    if (logoFile) {
      payload.append('image', logoFile);
    }

    try {
      setSaving(true);
      const res = await api.put(`/api/schools/update/${formData.school_id}`, payload, { params:  {lang: i18n.language} });
      console.log(res);
      swal(res.data.title, res.data.message, res.data.type);
    } catch (err) {
      console.error(err);
      swal(t('error'), t('unexpected_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  

  if (loading) return <Layout pageTitle={t('school')}><LoadingComponent /> </Layout>;
  if (error)   return <Layout pageTitle={t('school')}><ErrorComponent message={t('error')} body={t(error.message)} /></Layout>;
  if (!formData) return <Layout pageTitle={t('school')}><NoDataComponent message={t("no_data_available")}  body={t("no_data_available_body")}/></Layout>;
  return (
    <Layout pageTitle={t('school')}>
      <MDBCard className="p-3">
        <MDBCardBody>
          <MDBRow>
            <MDBCol md="3" className="text-center">
              <MDBCardTitle>{t('school_logo')}</MDBCardTitle>
              <div className="d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                {logoFile ? (
                  <img src={URL.createObjectURL(logoFile)} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                ) : (
                  // <img
                  //   src={`http://localhost:8080/api/school-logo/${formData.school_id}`}
                  //   alt="School Logo"
                  //   onError={(e) => (e.target.style.display = 'none')}
                  //   style={{ maxHeight: '100%', maxWidth: '100%' }}
                  // />
                  <MDBCardImage
                    src={logo[school_id]}
                    alt="Logo"
                    position="top"
                    style={{ height: '120px', objectFit: 'contain'}}
                  />
                )}
              </div>
              {canEdit && (
                <input
                  type="file"
                  accept="image/png"
                  className="form-control mt-2"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file.size > MAX_FILE_SIZE) {
                      swal('Error', t('file_size_exceeds_1mb_limit')+'.', 'error');
                      return;
                    }
                    if (file && file.type === 'image/png') {
                      setLogoFile(file);
                    } else {
                      alert('Only PNG files are allowed');
                    }
                  }}
                />
              )}
            </MDBCol>

            <MDBCol md="9">
              <MDBCardTitle>{t('general_information')}</MDBCardTitle>
              <MDBRow className="mb-2">
                <MDBCol>
                  <label>{t('commercial_name')} ({t('spanish')})</label>
                  {canEdit ? (
                    <MDBInput value={formData.commercial_name || ''} onChange={(e) => handleChange('commercial_name', e.target.value)} />
                  ) : (
                    <p>{formData.commercial_name}</p>
                  )}
                </MDBCol>
                <MDBCol>
                  <label>{t('business_name')} ({t('english')})</label>
                  {canEdit ? (
                    <MDBInput value={formData.business_name || ''} onChange={(e) => handleChange('business_name', e.target.value)} />
                  ) : (
                    <p>{formData.business_name}</p>
                  )}
                </MDBCol>
              </MDBRow>
              <MDBRow className="mb-2">
                <MDBCol>
                  <label>{t('description')} ({t('spanish')})</label>
                  {canEdit ? (
                    <MDBInput value={formData.description_es || ''} onChange={(e) => handleChange('description_es', e.target.value)} />
                  ) : (
                    <p>{formData.description_es}</p>
                  )}
                </MDBCol>
                <MDBCol>
                  <label>{t('description')} ({t('english')})</label>
                  {canEdit ? (
                    <MDBInput value={formData.description_en || ''} onChange={(e) => handleChange('description_en', e.target.value)} />
                  ) : (
                    <p>{formData.description_en}</p>
                  )}
                </MDBCol>
              </MDBRow>

              <MDBCardTitle>{t('address_and_contact')}</MDBCardTitle>
              <MDBRow className="mb-2">
                <MDBCol>
                  <label>{t('street')}</label>
                  {canEdit ? (
                    <MDBInput value={formData.street || ''} onChange={(e) => handleChange('street', e.target.value)} />
                  ) : (
                    <p>{formData.street}</p>
                  )}
                </MDBCol>
                <MDBCol>
                  <label>{t('ext_number')}</label>
                  {canEdit ? (
                    <MDBInput value={formData.ext_number || ''} onChange={(e) => handleChange('ext_number', e.target.value)} />
                  ) : (
                    <p>{formData.ext_number}</p>
                  )}
                </MDBCol>
                <MDBCol>
                  <label>{t('int_number')} <small>{t('optional')}</small> </label>
                  {canEdit ? (
                    <MDBInput value={formData.int_number || ''} onChange={(e) => handleChange('int_number', e.target.value)} />
                  ) : (
                    <p>{formData.int_number}</p>
                  )}
                </MDBCol>
              </MDBRow>

              <MDBRow className="mb-2">
                <MDBCol>
                  <label>{t('suburb')}</label>
                  {canEdit ? (
                    <MDBInput value={formData.suburb || ''} onChange={(e) => handleChange('suburb', e.target.value)} />
                  ) : (
                    <p>{formData.suburb}</p>
                  )}
                </MDBCol>
                <MDBCol>
                  <label>{t('city')}</label>
                  {canEdit ? (
                    <MDBInput value={formData.locality || ''} onChange={(e) => handleChange('locality', e.target.value)} />
                  ) : (
                    <p>{formData.locality}</p>
                  )}
                </MDBCol>
                <MDBCol>
                  <label>{t('state')}</label>
                  {canEdit ? (
                    <MDBInput value={formData.state || ''} onChange={(e) => handleChange('state', e.target.value)} />
                  ) : (
                    <p>{formData.state}</p>
                  )}
                </MDBCol>
              </MDBRow>

              <MDBRow className="mb-2">
                <MDBCol>
                  <label>{t('phone')}</label>
                  {canEdit ? (
                    <MDBInput value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
                  ) : (
                    <p>{formData.phone}</p>
                  )}
                </MDBCol>
                <MDBCol>
                  <label>{t('email')}</label>
                  {canEdit ? (
                    <MDBInput value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
                  ) : (
                    <p>{formData.email}</p>
                  )}
                </MDBCol>
              </MDBRow>

              {canEdit && (
                <div className="text-end">
                  <MDBBtn onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </MDBBtn>
                </div>
              )}
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
    </Layout>
  );
}
