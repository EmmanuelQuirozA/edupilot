// src/components/modals/DetailsModal.jsx
import React from 'react';
import { Link } from 'react-router-dom'
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
  MDBCol
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';

export default function DetailsModal({
  show,
  setShow,
  formGroups,
  data,
  title,
  size,
  navigateTo
}) {
  const { t, i18n } = useTranslation();

  const formatValue = (value, type) => {
    if (value == null || value === '') return t('not_available');
    const date = new Date(value);
    if (type === 'date') {
      return new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'long', day: '2-digit' }).format(date);
    }
    if (type === 'datetime') {
      return new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
    }
    return String(value);
  };

  const renderField = (field, colSize, idx) => (
    <MDBCol key={idx} size={colSize} >
      <p className="mb-1 text-muted">{t(field.label)}</p>
      <strong>{formatValue(data?.[field.key], field.type)}</strong>
    </MDBCol>
  );

  const renderGroups = () => {
    if (!Array.isArray(formGroups)) return null;
    return formGroups.map((group, gi) => {
      const colSize = Math.floor(12 / (group.columns || 1));
      return (
        <div key={gi} className="mb-2">
          {group.groupTitle && <h5>{t(group.groupTitle)}</h5>}
          <MDBRow>
            {Array.isArray(group.fields)
              ? group.fields.map((f, fi) => renderField(f, colSize, fi))
              : null}
          </MDBRow>
          {gi < formGroups.length - 1 && (
            <hr style={{ margin: '10px 0', borderTop: '1px solid rgba(0,0,0,0.5)' }} />
          )}
        </div>
      );
    });
  };

  return (
    <MDBModal open={show} onClose={setShow} tabIndex="-1">
      <MDBModalDialog size={size}>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle className="h3 fw-bold">
              {t(title)}
            </MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={() => setShow(false)} />
          </MDBModalHeader>
          <MDBModalBody>{renderGroups()}</MDBModalBody>
          <MDBModalFooter>
            {navigateTo && data && (
              <Link
                to={
                  typeof navigateTo === 'function'
                    ? navigateTo(data)
                    : navigateTo
                }
                style={{ textDecoration: 'none' }}
              >
                <MDBBtn color="info">
                  {t('go_to_details')}
                </MDBBtn>
              </Link>
            )}
            <MDBBtn color="secondary" onClick={() => setShow(false)}>
              {t('close')}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}
