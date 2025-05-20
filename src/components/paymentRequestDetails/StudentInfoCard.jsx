import React from 'react';
import { MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';

// Utils: simple date formatter
const formatDateTime = (value, intl, options) => {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat(intl.language, options).format(date);
};

export default function RequestHeader({ data, onApprove, onReject }) {
  const { student } = data;
  const { t, i18n } = useTranslation();

  function KeyValue({ label, type, value, icon: Icon }) {
    return (
      <MDBCol md="4">
        <p className="mb-0 text-muted">{t(label)}:</p>
        <strong>{
          value ? 
          (type==="dateTime" ? 
            formatDateTime(value, i18n) : value
          ) : t("not_available")}</strong>
      </MDBCol>
    );
  }

  return (
    <div className='groupStyle'>
      <MDBRow className="d-flex justify-content-between align-items-center">
        <MDBCol>
          <h5 className="text-uppercase text-muted small ">{t('student_information')}</h5>
        </MDBCol>
      </MDBRow>
      <MDBRow className='pb-4'>
        <KeyValue label={t("full_name")} type="text" value={student.full_name}/>
        <KeyValue label={t("email")} type="text" value={student.email}/>
        <KeyValue label={t("payment_reference")} type="text" value={student.payment_reference}/>
        <KeyValue label={t("phone_number")} type="text" value={student.phone_number}/>
        <KeyValue label={t("generation")} type="text" value={student.generation}/>
        <KeyValue label={t("class")} type="text" value={student.grade_group}/>
        <KeyValue label={t("scholar_level")} type="text" value={student.scholar_level_name}/>
      </MDBRow>
    </div>
  );
}
