// src/pages/ProfilePage.jsx
import React, { useState, useEffect }       from 'react'
import { useSearchParams }       from 'react-router-dom';
import { useTranslation }        from 'react-i18next'
import { useAuth } 							 from '../context/AuthContext';
import Layout                    from '../layout/Layout'
import { 
  MDBTabs, MDBTabsItem, MDBTabsLink,
  MDBTabsContent, MDBTabsPane,
  MDBInput, MDBBtn,
  MDBRow,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBCol
} from 'mdb-react-ui-kit';
import api from '../api/api';
import swal from 'sweetalert';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Password update state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'profile';
  const [basicActive, setBasicActive] = useState(tabFromUrl);

  const handleBasicClick = (value) => {
    if (value === basicActive) return;
    setBasicActive(value);
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    setBasicActive(searchParams.get('tab') || 'profile');
  }, [searchParams]);

  useEffect(() => {
    api.get(`/api/users/self-details?lang=${i18n.language}`)
      .then(res => setUserDetails(res))
      .catch(err => {
        console.error('Error fetching user details:', err);
        swal('Error', 'Could not load user details', 'error');
      })
      .finally(() => setLoading(false));
  }, [i18n.language]);

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      swal('Error', 'Passwords do not match', 'error');
      return;
    }

    try {
      await api.put('/api/users/password', {
        oldPassword,
        newPassword,
      });
      swal('Success', 'Password updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update error:', err);
      swal('Error', err?.response?.data?.message || 'Password update failed', 'error');
    }
  };

  return (
    <Layout pageTitle={t('profile')}>
      <MDBTabs className="mb-3 custom-fullwidth-tabs" style={{ backgroundColor: 'white', borderRadius: '40px' }}>
        {['profile', 'security'].map(tab => (
          <MDBTabsItem key={tab} className="flex-fill">
            <MDBTabsLink
              onClick={() => handleBasicClick(tab)}
              active={basicActive === tab}
            >
              {t(tab)}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>

      <MDBTabsContent>
        <MDBTabsPane open={basicActive === 'profile'}>
          {loading ? <p>{t('loading')}...</p> : (
            <MDBCard>
              <MDBCardHeader>
                <MDBRow className="d-flex justify-content-between align-items-center">
                  <MDBCol><h4 className="mb-0">{t('general_info')}</h4></MDBCol>
                </MDBRow>
              </MDBCardHeader>
              <MDBCardBody>
                <MDBRow>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="fullName" className="form-label">{t('full_name')}</label>
                    <MDBInput disabled type="text" className="form-control" id="fullName" value={userDetails.data?.full_name || ''}/>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="username" className="form-label">{t('username')}</label>
                    <MDBInput disabled type="text" className="form-control" id="username" value={userDetails.data?.username || ''}/>
                  </div>
                  <div className="col-12 mb-3">
                    <label htmlFor="address" className="form-label">{t('address')}</label>
                    <MDBInput disabled type="text" className="form-control" id="address" value={userDetails.data?.address || ''}/>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="personalEmail" className="form-label">{t('personal_email')}</label>
                    <MDBInput disabled type="email" className="form-control" id="personalEmail" value={userDetails.data?.personal_email || ''}/>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="systemEmail" className="form-label">{t('email')}</label>
                    <MDBInput disabled type="email" className="form-control" id="systemEmail" value={userDetails.data?.email || ''}/>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="rfc" className="form-label">{t('tax_id')}</label>
                    <MDBInput disabled type="text" className="form-control" id="tax_id" value={userDetails.data?.tax_id || ''}/>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="curp" className="form-label">{t('curp')}</label>
                    <MDBInput disabled type="text" className="form-control" id="curp" value={userDetails.data?.curp || ''}/>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="phone" className="form-label">{t('phone_number')}</label>
                    <MDBInput disabled type="tel" className="form-control" id="phone_number" value={userDetails.data?.phone_number || ''}/>
                  </div>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          )}
        </MDBTabsPane>

        <MDBTabsPane open={basicActive === 'security'}>
          <MDBCard>
            <MDBCardHeader>
              <h4 className="mb-0">{t('update_password')}</h4>
            </MDBCardHeader>

            <MDBCardBody>
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  handlePasswordUpdate(); // Trigger your handler
                }}
              >
                <MDBRow className="justify-content-center">
                  <MDBCol md="6">
                    <div className="mb-3">
                      <label htmlFor="oldPassword" className="form-label">{t('current_password')}</label>
                      <MDBInput 
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">{t('new_password')}</label>
                      <MDBInput
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmNewPassword" className="form-label">{t('confirm_new_password')}</label>
                      <MDBInput
                        id="confirmNewPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <div className="text-center">
                      <MDBBtn type="submit">{t('update_password')}</MDBBtn>
                    </div>
                  </MDBCol>
                </MDBRow>
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBTabsPane>
      </MDBTabsContent>
    </Layout>
  );
}
