// src/components/common/Header.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  MDBNavbar,
  MDBContainer,
  MDBIcon,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBInputGroup,
  MDBInput,
  MDBBtn,
  MDBRow
} from 'mdb-react-ui-kit'
import { useAuth } from '../../context/AuthContext'
// import GeneralCreateButton from './GeneralCreateButton';
import axios from 'axios'

export default function Header({ pageTitle, collapsed, toggleSidebar }) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { userDetails, user, logout } = useAuth()

  const [searchQuery, setSearchQuery]     = useState('')
  const [searchResults, setSearchResults] = useState([])

  const currentLanguage = (i18n.language || 'en').toUpperCase()

  const handleSearchChange = async e => {
    const val = e.target.value
    setSearchQuery(val)

    if (val.length >= 3) {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(
          `/api/students/list?lang=${i18n.language}&search_criteria=${val}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSearchResults(data)
      } catch (err) {
        console.error('Search error', err)
      }
    } else {
      setSearchResults([])
    }
  }

  const parseStudentName = fullName => {
    if (!fullName) return ''
    const parts = fullName.split('-')
    return parts.length > 1 ? parts.slice(1).join('-') : fullName
  }

  const handleResultClick = student => {
    const id = student.student_id || student.full_name.split('-')[0]
    setSearchResults([])
    setSearchQuery('')
    navigate(`/students/${id}`)
  }

  return (
    <MDBNavbar light bgColor="light" className="py-2">
      <MDBContainer fluid>
        {/* Left Side: Sidebar Toggle and Page Title */}
        {user ? (
        <div className="d-flex align-items-center">
          <div
            onClick={toggleSidebar}
            style={{ cursor: 'pointer', marginRight: '1rem' }}
          >
            <MDBIcon fas icon="bars" />
          </div>
          <h2 className="mb-0 d-none d-md-block" style={{ fontWeight:'Bold', color:'black'}}>{pageTitle}</h2>
        </div>):(<div/>)
        }

        {/* Right Side: Language Switcher and User Authentication */}
        <div className="d-flex align-items-center gap-4 position-relative">
          {user && ['SCHOOL_ADMIN', 'ADMIN'].includes(user.role.toUpperCase()) ? (
          <MDBRow>
            {/* <GeneralCreateButton canCreate={true} /> */}
          </MDBRow>
          ) : (null)}
          {/* Language Switcher Dropdown */}
          <MDBDropdown>
            <MDBDropdownToggle tag="button" className="btn btn-light p-2">
              <MDBIcon fas icon="globe" className="me-1" />
              {currentLanguage}
            </MDBDropdownToggle>
            <MDBDropdownMenu>
              <MDBDropdownItem onClick={() => i18n.changeLanguage('es')} className="dropdown-item">
                Español
              </MDBDropdownItem>
              <MDBDropdownItem onClick={() => i18n.changeLanguage('en')} className="dropdown-item">
                English
              </MDBDropdownItem>
            </MDBDropdownMenu>
          </MDBDropdown>
          
          {/* Search Input */}
          {user && ['SCHOOL_ADMIN', 'ADMIN'].includes(user.role.toUpperCase()) ? (
            <MDBContainer>
              <MDBInputGroup>
                <MDBInput 
                  label={t('search')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <MDBBtn className='search_btn' rippleColor="dark">
                  <MDBIcon icon="search" />
                </MDBBtn>
              </MDBInputGroup>
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {searchResults.map((result, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleResultClick(result)}
                    >
                      {parseStudentName(result.full_name)}
                    </div>
                  ))}
                </div>
              )}
            </MDBContainer>
          ) : (null)}
          {/* User Authentication Dropdown */}
          {user ? (
            <MDBDropdown>
              <MDBDropdownToggle tag="button" className="btn btn-primary p-2">
                {userDetails?.first_name || 'User'}
              </MDBDropdownToggle>
              <MDBDropdownMenu className="dropdown-menu">
                <MDBDropdownItem onClick={() => navigate('/profile')} className="dropdown-item cursor-pointer">
                  {t('profile')}
                </MDBDropdownItem>
                {/* <MDBDropdownItem onClick={() => navigate('/settings')} className="dropdown-item cursor-pointer">
                  {t('settings')}
                </MDBDropdownItem> */}
                
                <MDBDropdownItem onClick={() => {logout()
                    navigate('/login')
                  }}
                  className="dropdown-item cursor-pointer"
                >
                  {t('logout')}
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          ) : (null)}
        </div>
      </MDBContainer>
    </MDBNavbar>
  )
}
