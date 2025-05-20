// src/components/modals/FormModal.jsx
import React, { useState } from 'react';
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBValidation,
  MDBValidationItem,
  MDBInput,
  MDBRow,
  MDBCol,
  MDBSwitch,
  MDBSpinner
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';

export default function FormModal({
  show,
  setShow,
  formGroups,
  data,
  setData,
  onSave,
  title,
  size = 'lg',
  idPrefix = '',
  changeStatus,
  handleStatusSwitchChange,
  isSaving = false
}) {
  const { t } = useTranslation();
  const [validated, setValidated] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setValidated(true);
    if (e.target.checkValidity()) {
      onSave();
    }
  };

  const renderField = (field, colSize, idx) => (
    <MDBCol key={idx} size={colSize} className="mb-3">
      <MDBValidationItem feedback={t(field.errorMessage)} invalid>
        {field.type === 'select' ? (
          <>
            <label htmlFor={`${idPrefix}${field.key}`}>{t(field.label)}</label>
            <select
              id={`${idPrefix}${field.key}`}
              className="form-select"
              value={data[field.key] || ''}
              onChange={e => setData({ ...data, [field.key]: e.target.value })}
              required={field.required}
            >
              <option value="" disabled>{t('select_option')}</option>
              {field.options.map((opt, oi) => (
                <option key={oi} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </>
        ) : field.type === 'switch' ? (
          <MDBSwitch
            id={`${idPrefix}${field.key}`}
            label={t(field.label)}
            checked={data[field.key]}
            onChange={handleStatusSwitchChange}
            disabled={isSaving}
          />
        ) : (
          <MDBInput
            label={t(field.label)}
            id={`${idPrefix}${field.key}`}
            type={field.type}
            value={data[field.key] || ''}
            onChange={e => setData({ ...data, [field.key]: e.target.value })}
            required={field.required}
          />
        )}
      </MDBValidationItem>
    </MDBCol>
  );

  const renderGroups = () =>
    formGroups.map((group, gi) => {
      const colSize = Math.floor(12 / group.columns);
      return (
        <div key={gi} className="mb-4">
          {group.groupTitle && <h5>{t(group.groupTitle)}</h5>}
          <MDBRow>
            {group.fields.map((f, fi) => renderField(f, colSize, fi))}
          </MDBRow>
        </div>
      );
    });

  return (
    <MDBModal open={show} setShow={setShow} tabIndex="-1">
      <MDBValidation onSubmit={handleSubmit} noValidate validated={validated}>
        <MDBModalDialog size={size}>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t(title)}</MDBModalTitle>
              <MDBBtn type="button" className="btn-close" color="none" onClick={() => setShow(false)} />
            </MDBModalHeader>
            <MDBModalBody>{renderGroups()}</MDBModalBody>
            <MDBModalFooter>
              {changeStatus && (
                <MDBSwitch
                  id="statusSwitch"
                  label={t('change_status')}
                  checked={data?.enabled}
                  onChange={handleStatusSwitchChange}
                  disabled={isSaving}
                />
              )}
              <MDBBtn type="button"  color="secondary" onClick={() => setShow(false)} disabled={isSaving}>
                {isSaving ? <MDBSpinner size="sm" /> : t('close')}
              </MDBBtn>
              <MDBBtn type="submit" form="validationForm" color="primary" disabled={isSaving}>
                {isSaving ? <MDBSpinner size="sm" /> : t('save_changes')}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBValidation>
    </MDBModal>
  );
}