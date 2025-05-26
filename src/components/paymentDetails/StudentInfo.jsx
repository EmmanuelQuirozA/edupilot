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
        <KeyValue label={t("full_name")} type="text" value={data.student_full_name}/>
        <KeyValue label={t("email")} type="text" value={data.email}/>
        <KeyValue label={t("payment_reference")} type="text" value={data.payment_reference}/>
        <KeyValue label={t("phone_number")} type="text" value={data.phone_number}/>
        <KeyValue label={t("generation")} type="text" value={data.generation}/>
        <KeyValue label={t("class")} type="text" value={data.grade_group}/>
        <KeyValue label={t("scholar_level")} type="text" value={data.scholar_level_name}/>
      </MDBRow>
    </div>
  );
}
