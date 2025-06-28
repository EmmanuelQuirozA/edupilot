// src/components/common/AsyncSearchableSelect.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MDBIcon, MDBInput, MDBSpinner } from 'mdb-react-ui-kit';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

/**
 * A “select with built-in search” that calls loadOptions(searchText)
 * whenever the user types, and displays the returned options.
 *
 * Props:
 * - loadOptions: async (searchText) => [{ value, label }, …]
 * - value: the currently selected value
 * - onChange: (newValue) => void
 * - placeholder: string for the closed box when nothing is selected
 * - id: string (for accessibility)
 * - disabled: boolean
 */
export default function AsyncSearchableSelect({
  loadOptions,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  id
}) {
  const { t } = useTranslation();
  const containerRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [options, setOptions]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const searchInputRef = useRef(null);

  // Whenever the `value` prop changes from outside, try to reset the label
  // by looking it up in the last-loaded options (if any).
  useEffect(() => {
    const match = options.find((opt) => opt.value === value);
    if (match) {
      setSelectedLabel(match.label);
    }
  }, [value, options]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Debounce + fetch options whenever searchText changes
  useEffect(() => {
    if (!isOpen) return;

    // Only fetch if at least 1 character typed (optional)
    const doFetch = () => {
      setLoading(true);
      loadOptions(searchText)
        .then((opts) => setOptions(opts))
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    };

    const handler = setTimeout(doFetch, 300);
    return () => clearTimeout(handler);
  }, [searchText, isOpen, loadOptions]);

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen((o) => !o);
      setSearchText('');      // clear search on open
      setOptions([]);         // clear old options
    }
  };

  const handleOptionClick = (opt) => {
    onChange(opt);
    setSelectedLabel(opt.label);  // ← save the label
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="position-relative my-searchable-select"
      style={{ minWidth: '200px' }}
    >
      {/* The “closed” select box */}
      <div
        id={id}
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={(e) => e.key === 'Enter' && toggleOpen()}
        className={`form-control d-flex justify-content-between align-items-center ${
          disabled ? 'bg-light text-muted' : ''
        }`}
        style={{ cursor: 'default' }}
      >
        <span
          style={{
            flex: 1,                    // allow it to shrink
            whiteSpace: 'nowrap',       // no wrapping
            overflow: 'hidden',         // hide overflow
            textOverflow: 'ellipsis',   // show “…” if too long
            userSelect: 'none'          // Prevents highlighting
          }}
        >
          {value ? value.label : <span className="text-muted">{placeholder}</span>}
        </span>
        <MDBIcon
          fas
          icon={isOpen ? 'chevron-up' : 'chevron-down'}
          className="text-muted"
        />
      </div>

      {/* The dropdown panel */}
      {isOpen && (
        <div
          className="position-absolute bg-white border mt-1"
          style={{
            zIndex: 1000,
            width: '100%',
            maxHeight: '250px',
            overflowY: 'auto',
            borderRadius: '0 0 4px 4px'
          }}
        >
          {/* Search bar */}
          <div className="p-2">
            {/* <MDBInput
              size="sm"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              inputRef={searchInputRef}
            /> */}
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder={t("search")+"..."}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              ref={searchInputRef}
            />
          </div>

          {/* Options list or loading indicator */}
          {loading ? (
            <div className="px-3 py-1 text-center">
              <MDBSpinner size="sm" /> {/** loading… */}
            </div>
          ) : (
            <ul className="list-unstyled mb-0" 
              // style={{ cursor: 'pointer' }}
            >
              {options.length === 0 ? (
                <li className="px-3 py-1 text-muted">No results</li>
              ) : (
                options.map((opt) => (
                  <li
                    key={opt.value}
                    className="px-3 py-1 hover-bg-light"
                    onClick={() => handleOptionClick(opt)}
                    style={{}}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

AsyncSearchableSelect.propTypes = {
  loadOptions: PropTypes.func.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string
};
