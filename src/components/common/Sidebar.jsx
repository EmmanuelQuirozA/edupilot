import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MDBContainer,
  MDBListGroup,
  MDBListGroupItem,
  MDBTooltip,
  MDBBtn
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// define your menu by roleName
const menuConfig = {
  ADMIN: [
    {
      level: 'Dashboards',
      items: [
        { name: 'dashboard', icon: 'bi bi-grid', link: '/dashboard' }
      ]
    },
    {
      level: 'Management',
      items: [
        { name: 'schools',   icon: 'bi bi-building',     link: '/schools' },
        { name: 'finance',   icon: 'bi bi-coin',         link: '/finance',   comingSoon: true },
        { name: 'users',     icon: 'fa-solid fa-user-graduate', link: '/users' }
      ]
    },
    {
      level: 'Settings',
      items: [
        { name: 'settings', icon: 'bi bi-gear', link: '/settings', comingSoon: true }
      ]
    }
  ],

  SCHOOL_ADMIN: [
    {
      level: 'Dashboards',
      items: [
        { name: 'dashboard', icon: 'bi bi-house-fill', link: '/dashboard' }
      ]
    },
    {
      level: 'Management',
      items: [
        { name: 'finance', icon: 'bi bi-coin', link: '/paymentreports' },
        { name: 'schools', icon: 'bi bi-building', link: '/schools' },
        { name: 'classes', icon: 'bi bi-card-checklist', link: '/classes' },
        { name: 'users', icon: 'bi bi-person-badge', link: '/users' },
        { name: 'teachers', icon: 'bi bi-briefcase', link: '/teachers' },
        { name: 'students', icon: 'bi bi-mortarboard', link: '/students' },
        { name: 'parents', icon: 'bi bi-people-fill', link: '/parents', comingSoon: true },
        { name: 'subjects', icon: 'bi bi-journal-text', link: '/subjects', comingSoon: true },
        { name: 'lessons', icon: 'bi bi-book', link: '/lessons', comingSoon: true },
        { name: 'exams', icon: 'bi bi-pencil-square', link: '/exams', comingSoon: true },
        { name: 'assignments', icon: 'bi bi-file-earmark-text', link: '/assignments', comingSoon: true },
        { name: 'results', icon: 'bi bi-bar-chart-line', link: '/results', comingSoon: true },
        { name: 'attendance', icon: 'bi bi-calendar-check', link: '/attendance', comingSoon: true },
        { name: 'events', icon: 'bi bi-calendar-event', link: '/events', comingSoon: true },
        { name: 'messages', icon: 'bi bi-chat-dots', link: '/messages', comingSoon: true },
        { name: 'announcements', icon: 'bi bi-megaphone', link: '/announcements', comingSoon: true },
      ]
    },
    {
      level: 'Apps',
      items: [
        { name: 'coffee', icon: 'bi bi-cup-hot', link: '/coffee' }
      ]
    },
    {
      level: 'Settings',
      items: [
        { name: 'profile',  icon: 'bi bi-person-circle', link: '/profile' },
        { name: 'settings', icon: 'bi bi-gear',          link: '/settings' }
      ]
    }
  ]
};

export default function Sidebar({ collapsed, isMobile, mobileOpen }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = (user?.role || user?.roleName || '')?.toUpperCase();
  if (!user) return null 
  const groups   = menuConfig[role] || [];

  // width in px
  const widthPx = collapsed ? 80 : 200;

  return (
    <MDBContainer
      id="sidebar"
      className="sidebar d-flex flex-column px-0"
      style={{
        width: `${widthPx}px`,
        // backgroundColor: '#343a40',
        color: '#fff',

        // on mobile, position as fixed drawer
        top:      isMobile ? 0 : undefined,
        left:     isMobile ? 0 : undefined,
        height:   isMobile ? '100vh' : undefined,

        // slide in/out
        transform: isMobile
          ? (mobileOpen ? 'translateX(0)' : `translateX(-${widthPx}px)`)
          : undefined,
        transition: isMobile ? 'transform 0.3s ease' : undefined,

        zIndex: isMobile ? 1050 : undefined,
      }}
    >
      {/* Logo */}
      <div className="logo-details d-flex justify-content-center" style={{ margin: '20px 0' }}>
        <img className="logo_img" src="http://localhost:3000/monarch_logo.png" alt="Logo" />
        {!collapsed && <span className="logo_name ms-2">Monarch</span>}
      </div>

      <MDBListGroup 
        light 
        className="mb-auto" 
        style={{ 
          overflowY: 'auto', 
          scrollbarWidth: 'none',           // Firefox
          msOverflowStyle: 'none',
          flex: 1 ,
          borderRadius: 0
        }}
      >
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.items.map(item => {
              const isActive = location.pathname.endsWith(item.link)
              return (
                  <MDBListGroupItem
                    tag={Link}
                    to={item.comingSoon ? '#' : item.link}
                    key={item.name}
                  active={isActive.toString()}
                    className={`
                      d-flex pb-1 pt-1 align-items-center px-2
                      ${collapsed ? 'justify-content-center' : ''} 
                      ${isActive ? 'ms-2' : 'mx-2'} 
                      `}
                    style={{
                      border: 'none',
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? '#000' : '#fff',
                      opacity: item.comingSoon ? 0.5 : 1,
                    pointerEvents: item.comingSoon ? 'none' : 'auto',
                    borderRadius: isActive ? '0.5rem 0 0 0.5rem' : '',
                    }}
                  >
                    <i className={item.icon} />
                    {!collapsed && <span className="ms-2 text-nowrap">{t(item.name)}</span>}
                    {!collapsed && item.comingSoon && (
                        <span
                          className="text-nowrap"
                          style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: '#ed7d31',
                            color: 'white',
                            fontSize: '0.6rem',
                            padding: '2px 4px',
                            borderRadius: '0 4px 0 4px'
                          }}
                        >
                        {t('coming_soon')}
                      </span>
                    )}
                    {collapsed && item.comingSoon && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          backgroundColor: '#ed7d31',
                          color: 'white',
                          fontSize: '0.6rem',
                          padding: '2px 4px',
                          borderRadius: '0 4px 0 4px'
                        }}
                      >
                        <i className="bi bi-info-circle position-absolute top-0 end-0 text-warning" />
                      </span>
                    )}
                  </MDBListGroupItem>
              )
            })}
            {gi < groups.length - 1 && (
              <hr style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255,0.2)' }} />
            )}
          </React.Fragment>
        ))}
      </MDBListGroup>

      {/* Logout button */}
      <div className="p-2 d-flex justify-content-center">
        <MDBBtn color="danger" size="sm" onClick={logout}>
          <i className="bi bi-box-arrow-left" />
        </MDBBtn>
      </div>
    </MDBContainer>
  )
};
