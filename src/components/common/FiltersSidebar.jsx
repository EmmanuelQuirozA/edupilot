// src/components/common/FiltersSidebar.jsx
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function FiltersSidebar({
  filters,
  setFilters,
  applyFilters,
  clearFilters,
  isVisible,
  toggleVisibility,
}) {
  const { t } = useTranslation();
  const sidebarRef = useRef();

  useEffect(() => {
    function handleOutsideClick(e) {
      if (isVisible && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        toggleVisibility();
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isVisible, toggleVisibility]);

  return (
    <>
      {isVisible && <div className="sidebar-overlay" onClick={toggleVisibility} />}
      <div
        className={`right-sidebar ${isVisible ? 'visible' : ''}`}
        ref={sidebarRef}
      >
        <button className="btn btn-light close-btn" onClick={toggleVisibility}>
          ×
        </button>
        <h4>{t('filters')}</h4>
        {filters.map((f, i) => (
          <div className="mb-3" key={i}>
            <label htmlFor={f.id} className="form-label">
              {f.label}
            </label>
            {f.type === 'select' ? (
              <select
                id={f.id}
                className="form-select"
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
              >
                {f.options.map((opt, oi) => (
                  <option key={oi} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                id={f.id}
                className="form-control"
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary" onClick={applyFilters}>
            {t('apply_filters')}
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            {t('clear_filters')}
          </button>
        </div>
      </div>
    </>
  );
}
