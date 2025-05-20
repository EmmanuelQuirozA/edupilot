// src/components/Layout.jsx
import React, { useContext, useState, useEffect } from 'react';
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'
import Footer from '../components/common/Footer'

export default function Layout({ pageTitle, children }) {
  // desktop collapse
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  // mobile drawer
  const [mobileOpen, setMobileOpen]       = useState(false);
  // track viewport
  const [isMobile, setIsMobile]           = useState(window.innerWidth < 768);

  // update isMobile on resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(v => !v)
    } else {
      setDesktopCollapsed(v => !v)
    }
  };
  
  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle]);

  const sidebarWidth = desktopCollapsed ? '80px' : '200px'

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Sidebar */}
        <Sidebar
          collapsed={desktopCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          toggleSidebar={toggleSidebar}
        />
      
        {/* overlay on mobile when sidebar is open */}
        {isMobile && mobileOpen && (
          <div
            onClick={toggleSidebar}
          style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100vh',
              background: 'rgba(0,0,0,0.4)',
              zIndex: 1040,
            }}
          />
        )}

        {/* Content area */}
        <div
          className="main-container"
          style={{
            marginLeft: isMobile ? 0 : sidebarWidth,
            maxWidth: isMobile ? '100%' : `calc(100% - ${sidebarWidth})`,
          }}
        >
          {/* Header receives the toggle function */}
          <Header pageTitle={pageTitle} toggleSidebar={toggleSidebar} />
          {/* page content */}
          <main className='mb-6' style={{ flex: 1, padding: '1rem' }}>
            {children}
          </main>
        </div>
      </div>

      {/* sticky footer at bottom */}
      <Footer />
    </div>
  )
}
