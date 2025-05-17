// src/components/DetailsModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const FormModal = ({ 
  open, 
  onClose, 
  formGroups, 
  data, 
  title, // Modal title
  size, // Modal size. E.g.: "xl"
  details
}) => {
  const navigate = useNavigate(); // Initialize navigate here

  // Then you can use navigate in your onClick:
  const goToStudentDetail = () => {
    navigate(`/studentdetail/${data.student_id}`);
  };

  const { t, i18n } = useTranslation();

  // Helper function to format values based on field type
  const formatValue = (value, type) => {
    if (!value) return 'N/A';
    if (type === 'date') {
      const date = new Date(value);
      if (i18n.language === 'es') {
        // Format as "06 de enero de 2025" then replace " de " before year with " del "
        const formatted = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
        return formatted.replace(/ de (\d{4})$/, ' del $1');
      } else {
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(date);
      }
    }
    if (type === 'datetime') {
      const date = new Date(value);
      if (i18n.language === 'es') {
        const formatted = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
        return formatted.replace(/ de (\d{4})$/, ' del $1');
      } else {
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
      }
    }
    // For other types (e.g. text, number) simply return the value.
    return value;
  };

  // Helper to render an individual field (read-only) with formatted value
  const renderField = (field, colSize, index) => {
    return (
      <MDBCol key={index} size={colSize}>
        <p className='mb-0'>{t(field.label)}</p>
        <strong>{formatValue(data?.[field.key], field.type)}</strong>
      </MDBCol>
    );
  };

  // Render the form groups
  const renderFormGroups = () => {
    return formGroups.map((group, groupIndex) => {
      const colSize = Math.floor(12 / group.columns);
      return (
        <div key={groupIndex}>
          {group.groupTitle && <h5 className="mb-3">{t(group.groupTitle)}</h5>}
          <MDBRow>
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
          <MDBModalBody>
            {renderFormGroups()}
          </MDBModalBody>
          <MDBModalFooter>
            {details && (
              <MDBBtn 
                color="info"
                onClick={goToStudentDetail}
              >
                {t('go_to_details')}
              </MDBBtn>
            )}
            <MDBBtn color="secondary" onClick={onClose}>
              {t('close')}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default FormModal;
