// src/components/FormModal.js
import React, { useState, useEffect } from 'react'
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBSwitch,
  MDBSpinner,
  MDBValidation,
  MDBValidationItem
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';

const FormModal = ({ 
  open, 
  onClose, 
  formGroups, 
  data, 
  setData, 
  onSave, 
  title, // Modal title
  size, // Modal size. E.g.: "xl"
  idPrefix, // Field ID prefix. E.g.: "update_" or "create_"
  changeStatus,
  handleStatusSwitchChange,
  isSaving
}) => {
  const { t } = useTranslation();
  const [validated, setValidated] = useState(false);

  // This handler wraps the onSave so that it is only called if the form is valid.
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);
    // checkValidity() uses native HTML5 validation:
    if (e.target.checkValidity()) {
      onSave();
    }
  };


  // Helper to render a nested container (for nested groups)
  const renderNestedContainer = (container, colSize, index) => {
    const nestedColSize = Math.floor(12 / (container.columns || 1));
    return (
      <MDBCol key={index} size={colSize}>
        <MDBRow>
          {container.fields.map((nestedGroup, nestedIndex) => {
            const nestedGroupColSize = Math.floor(12 / (nestedGroup.columns || 1));
            return (
              <MDBCol key={nestedIndex} size={nestedColSize}>
                <div className="mb-3">
                  {nestedGroup.groupTitle && <h6 className="mb-3">{t(nestedGroup.groupTitle)}</h6>}
                  <MDBRow>
                    {nestedGroup.fields.map((nestedField, fieldIndex) => (
                      <MDBCol key={fieldIndex} size={nestedGroupColSize}>
                        <MDBValidationItem
                          feedback={t(nestedField.errorMessage) || t('field_required')}
                          invalid
                        >
                          <MDBInput
                            label={t(nestedField.label)}
                            id={`${idPrefix}${nestedField.key}`}
                            type={nestedField.type || 'text'}
                            value={data?.[nestedField.key] ?? ''}
                            onChange={(e) =>
                              setData({ ...data, [nestedField.key]: e.target.value })
                            }
                            required={nestedField.required || false}
                            pattern={nestedField.pattern || undefined}
                          />
                        </MDBValidationItem>
                      </MDBCol>
                    ))}
                  </MDBRow>
                </div>
              </MDBCol>
            );
          })}
        </MDBRow>
      </MDBCol>
    );
  };

  // Helper to render an individual field or nested group if applicable
  const renderField = (field, colSize, index) => {
    // If the field has a nested fields array but no own key, it's a nested container.
    if (!field.key && field.fields) {
      return renderNestedContainer(field, colSize, index);
    } else if (field.fields) {
      // For a nested group (with its own key as well as nested fields)
      const nestedColSize = Math.floor(12 / (field.columns || 1));
      return (
        <MDBCol key={index} size={colSize}>
          <div className="mb-3">
            <MDBRow>
              {field.fields.map((nestedField, nestedIndex) => (
                <MDBCol key={nestedIndex} size={nestedColSize}>
                  <MDBValidationItem
                    feedback={t(nestedField.errorMessage) || t('field_required')}
                    invalid
                  >
                    <MDBInput
                      label={t(nestedField.label)}
                      id={`${idPrefix}${nestedField.key}`}
                      type={nestedField.type || 'text'}
                      value={data?.[nestedField.key] ?? ''}
                      onChange={(e) =>
                        setData({ ...data, [nestedField.key]: e.target.value })
                      }
                      required={nestedField.required || false}
                      pattern={nestedField.pattern || undefined}
                    />
                  </MDBValidationItem>
                </MDBCol>
              ))}
            </MDBRow>
          </div>
        </MDBCol>
      );
    } else if (field.type === 'image') {
      // Render image field without validation
      return (
        <MDBCol key={index} size={colSize} className="d-flex justify-content-center align-items-center">
          <div className="mb-3">
            <img 
              src={data?.[field.key] || 'https://media.istockphoto.com/id/1223671392/vector/default-profile-picture-avatar-photo-placeholder-vector-illustration.jpg?s=612x612&w=0&k=20&c=s0aTdmT5aU6b8ot7VKm11DeID6NctRCpB755rA1BIP0='} 
              alt={t(field.label)} 
              className="img-fluid rounded" 
              style={{ maxHeight: '150px' }}
            />
          </div>
        </MDBCol>
      );
    } else if (field.type === 'select') {
      if (field.required) {
        // Render a select field with validation
        return (
          <MDBCol key={index} size={colSize}>
            <MDBValidationItem
              feedback={t(field.errorMessage) || t('select_option_required')}
              invalid
            >
              <label htmlFor={`${idPrefix}${field.key}`}>{t(field.label)}</label>
              <select
                id={`${idPrefix}${field.key}`}
                className="form-select"
                value={data?.[field.key] ?? ''}
                onChange={(e) =>
                  setData({ ...data, [field.key]: e.target.value })
                }
                required={field.required || false}
              >
                <option value="" disabled>{t('select_option')}</option>
                {field.options && field.options.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </MDBValidationItem>
          </MDBCol>
        );
      } else {
        // Render a select field with validation
        return (
          <MDBCol key={index} size={colSize}>
            <MDBValidationItem
              feedback={t(field.errorMessage) || t('select_option_required')}
              invalid
            >
              <label htmlFor={`${idPrefix}${field.key}`}>{t(field.label)}</label>
              <select
                id={`${idPrefix}${field.key}`}
                className="form-select"
                value={data?.[field.key] ?? ''}
                onChange={(e) =>
                  setData({ ...data, [field.key]: e.target.value })
                }
                required={field.required || false}
              >
                <option value="">{t('select_option')}</option>
                {field.options && field.options.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </MDBValidationItem>
          </MDBCol>
        );

      }
    } else if (field.type === 'amountWithUnit') {
    
      return (
        <MDBCol key={index} size={colSize}>
          <div className="input-group mb-3">
            <MDBInput
              label={t(field.label)}
              id={`${idPrefix}${field.key1}`}
              type="number"
              value={data?.[field.key1] ?? ''}
              onChange={(e) =>
                setData({ ...(data || {}), [field.key1]: e.target.value })
              }
              required={field.required || false}
              pattern={field.pattern || undefined}
              disabled={field.disabled || false}
              className="form-control"
            />
            <select
              className="form-select"
              id={`${idPrefix}${field.key2}`}
              style={{minWidth:"62px"}}
              value={data?.[field.key2] ?? ''}
              onChange={e =>
                setData({ ...(data || {}), [field.key2]: e.target.value })
              }
            >
              <option value="$">$</option>
              <option value="%">%</option>
            </select>
          </div>
        </MDBCol>
      );
    } else if (field.type === 'description') {
      // Standard input field with validation
      return (
        <MDBCol key={index} size={colSize} >
          <MDBCol key={index} size={colSize} className='px-3 py-1' style={{backgroundColor:'#dadfec'}}>
            <MDBCol className='small'>
              <p className='fw-bold mb-0'>{t(field.key)}</p>
              {t(field.label)}
            </MDBCol>
          </MDBCol>
        </MDBCol>
      );
    } else {
      // Standard input field with validation
      return (
        <MDBCol key={index} size={colSize}>
          <MDBValidationItem
            feedback={t(field.errorMessage) || t('field_required')}
            invalid
          >
            <MDBInput
              label={t(field.label)}
              id={`${idPrefix}${field.key}`}
              type={field.type || 'text'}
              value={data?.[field.key] ?? ''}
              onChange={(e) =>
                setData({ ...data, [field.key]: e.target.value })
              }
              required={field.required || false}
              pattern={field.pattern || undefined}
              disabled={field.disabled || false}
            />
          </MDBValidationItem>
        </MDBCol>
      );
    }
  };

  // Render the form groups
  const renderFormGroups = () => {
    return formGroups.map((group, groupIndex) => {
      const colSize = Math.floor(12 / group.columns);
      return (
        <div key={groupIndex}>
          {group.groupTitle && <h5 className="mb-3">{t(group.groupTitle)}</h5>}
          <MDBRow className='gap-3'>
            {group.fields.map((field, fieldIndex) =>
              renderField(field, colSize, fieldIndex)
            )}
          </MDBRow>
          {groupIndex < formGroups.length - 1 && (
            <hr style={{ margin: '10px 0', borderTop: '1px solid rgba(0,0,0,0.5)' }} />
          )}
        </div>
      );
    });
  };

  return (
    <MDBModal open={open} onClose={onClose} tabIndex="-1">
      <MDBModalDialog size={size}>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{t(title)}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={onClose}></MDBBtn>
          </MDBModalHeader>
          {/* Wrap modal body and footer in MDBValidation.
              onSubmit will check all fields and only then call onSave */}
          <MDBValidation onSubmit={handleSubmit} noValidate validated={validated} id="validationForm">
            <MDBModalBody>
              {renderFormGroups()}
            </MDBModalBody>
            </MDBValidation>
            <MDBModalFooter>
              {/* Left-aligned buttons. Not implemented, just for future needs*/}
              {/* Right-aligned buttons */}
              {changeStatus && (
                <MDBSwitch  
                  id="statusSwitch"
                  label={t('change_status')}
                  checked={(data?.enabled || data?.user_enabled) ?? false}
                  onChange={handleStatusSwitchChange}
                  disabled={isSaving}
                />
              )}
              <MDBBtn color="secondary" onClick={onClose} disabled={isSaving}>
                {isSaving ? <MDBSpinner size="sm" /> : t('close')}
              </MDBBtn>
              {onSave && (
                <MDBBtn type="submit" color="primary" disabled={isSaving} form="validationForm">
                  {isSaving ? <MDBSpinner size="sm" /> : t('save_changes')}
                </MDBBtn>
              )}
            </MDBModalFooter>
          
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default FormModal;
