// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBInput,
  MDBCheckbox,
  MDBBtn,
} from 'mdb-react-ui-kit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Translations
import { AuthContext } from '../context/AuthContext';
import swal from 'sweetalert';
import Header from '../components/common/Header';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');       // For email input
  const [password, setPassword] = useState('');   // For password input
  const [error, setError] = useState('');         // To display error messages
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = { usernameOrEmail: email,password };
      const response = await axios.post(
        `${baseUrl}/api/auth/login`,
        payload,
        { params: { lang: i18n.language || 'es' } }
      );

      // Use the login function from AuthContext to update state
      login({ token: response.data.token, user: response.data.user });
      
      // Extract role from response (assuming it's stored as roleName)
      const decoded = jwtDecode(response.data.token);
      const role = (decoded.role || '').toUpperCase();

      // Redirect based on role
      if (role === 'ADMIN') {
        navigate('/dashboard');
      } else if (role === 'SCHOOL_ADMIN') {
        navigate('/dashboard');
      } else if (role === 'STUDENT') {
        navigate('/dashboard');
      } else {
        // Fallback redirect
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError(err.message);
      }
      
    }
  };

  return (
    <div >
    {/* Header receives the toggle function */}
    <Header />
    <MDBContainer className="my-5">
      <MDBRow className="justify-content-center">
        <MDBCol md="6">
          <MDBCard>
            <MDBCardHeader className="text-center">
              <h5>{t('login')}</h5>
            </MDBCardHeader>
            <MDBCardBody>
              <form onSubmit={handleLogin}>
                <MDBInput
                  wrapperClass="mb-4"
                  label={t('username_or_email')}
                  id="emailInput"
                  type="text"
                  size="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <MDBInput
                  wrapperClass="mb-4"
                  label={t('password')}
                  id="passwordInput"
                  type="password"
                  size="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="d-flex justify-content-between mb-4">
                  <MDBCheckbox
                    name="rememberMe"
                    id="rememberMe"
                    label={t('remember_me')}
                  />
                  <a href="#!">{t('forgot_password')}</a>
                </div>
                {error && <p className="text-danger">{t(error)}</p>}
                <MDBBtn className="mb-0 px-5 p-2" size="lg" type="submit">
                  {t('login')}
                </MDBBtn>
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
    </div>
  );
};

export default Login;
