import React, { useState, useRef, useEffect } from 'react';
import { MDBIcon, MDBInput } from 'mdb-react-ui-kit';
import PropTypes from 'prop-types';

/**
 * Props:
 * - options: array of { value: any, label: string }
 * - value: the currently selected value (must match one of options.value)
 * - onChange: fn(newValue)
 * - placeholder: string shown when nothing is selected
 * - disabled: boolean
 * - id: string (for accessibility)
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  id
}) {
  const containerRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  // Filter options by label (case-insensitive)
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchText.toLowerCase())
  );

  // Find the label of the currently selected value
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen((o) => !o);
      setSearchText(''); // clear search when opening
    }
  };

  const handleOptionClick = (opt) => {
    onChange(opt.value);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="position-relative"
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
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        <span>
          {selectedLabel || <span className="text-muted">{placeholder}</span>}
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
            maxHeight: '200px',
            overflowY: 'auto',
            borderRadius: '0 0 4px 4px'
          }}
        >
          {/* Search bar */}
          <div className="p-2">
            <MDBInput
              size="sm"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Options list */}
          <ul
            className="list-unstyled mb-0"
            style={{ cursor: 'pointer' }}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-muted">
                No results
              </li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className="px-3 py-2 hover-bg-light"
                  onClick={() => handleOptionClick(opt)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

SearchableSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string
};
