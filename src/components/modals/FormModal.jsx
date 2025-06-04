// src/components/modals/FormModal.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams }       from 'react-router-dom';
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
  MDBSpinner,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane
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
  isSaving = false,
  mass_upload = false,
  mass_component
}) {
  const { t } = useTranslation();
  const [validated, setValidated] = useState(false);

  // ── Preserve the active tab in URL ────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'monthlyPayments';
  const [basicActive, setBasicActive] = useState(tabFromUrl);

  const handleSubmit = e => {
    e.preventDefault();
    setValidated(true);
    if (e.target.checkValidity()) {
      onSave();
    }
  };

  const renderField = (field, colSize, idx) => (
    <MDBCol key={idx} size={colSize} className="mb-3">
      <MDBValidationItem feedback={t("field_required")} invalid>
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
              <option value="" disabled>{"— "+t('select_option')+" —"}</option>
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
        <div key={gi} className="mb-2">
          {group.groupTitle && <h5>{t(group.groupTitle)}</h5>}
          <MDBRow>
            {group.fields.map((f, fi) => renderField(f, colSize, fi))}
          </MDBRow>
        </div>
      );
  });

  const handleBasicClick = (value) => {
    if (value === basicActive) return;
    setBasicActive(value);
    setSearchParams({ tab: value });
  };
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'single_creation';
    setBasicActive(currentTab);
  }, [searchParams]);

  return (
    <MDBModal open={show} onClose={() => setShow(false)} >
      {/* MDBValidation renders a <form> under the hood */}
      <MDBValidation onSubmit={handleSubmit} noValidate validated={validated}>
        <MDBModalDialog size={size}>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{t(title)}</MDBModalTitle>
              <MDBBtn type="button" className="btn-close" color="none" onClick={() => setShow(false)} />
            </MDBModalHeader>
            <MDBModalBody>
              
              {mass_upload ? (
              <>
                <MDBTabs
                  className="mb-3 custom-fullwidth-tabs"
                  style={{ backgroundColor: 'white', borderRadius: '0.5rem' }}
                >
                  {['single_creation','mass_creation'].map((tab, i, arr) => (
                    <MDBTabsItem key={tab} className="flex-fill">
                      <MDBTabsLink
                        onClick={() => handleBasicClick(tab)}
                        active={basicActive === tab}
                      >
                        { i === 0 && t('single_creation') }
                        { i === 1 && t('mass_creation') }
                      </MDBTabsLink>
                    </MDBTabsItem>
                  ))}
                </MDBTabs>

                <MDBTabsContent>
                  <MDBTabsPane open={basicActive === 'single_creation'}>
                    {renderGroups()}
                  </MDBTabsPane>
                  <MDBTabsPane open={basicActive === 'mass_creation'}>
                    {mass_component}
                  </MDBTabsPane>
                </MDBTabsContent>
              </>
              ): renderGroups()}
              
            </MDBModalBody>
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
              <MDBBtn
                type="button"
                outline color="secondary" 
                onClick={() => setShow(false)}
                disabled={isSaving}
              >
                {isSaving ? <MDBSpinner size="sm" /> : t('close')}
              </MDBBtn>
              {/* Normal submit button inside the form: */}
              <MDBBtn
                type="submit"
                color="primary"
                disabled={isSaving}
              >
                {isSaving ? <MDBSpinner size="sm" /> : t('submit')}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBValidation>
    </MDBModal>
  );
}