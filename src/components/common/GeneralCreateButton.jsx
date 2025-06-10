// src/components/GeneralCreateButton.jsx
import React, { useState, useEffect } from 'react';
import {
  MDBBtn,
  MDBIcon,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBInput,
  MDBRow,
  MDBCol,
  MDBSpinner
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import useClassActions from '../../hooks/classes/useClassActions';
import { getScholarLevels } from '../../api/studentApi';
import { getSchools } from '../../api/schoolsApi';

export default function GeneralCreateButton({ canCreate, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [show, setShow] = useState(false);
  const { isSaving, createClass } = useClassActions(() => {
    setShow(false);
  });

  const [scholarLevels, setScholarLevels] = useState([]);
  const [schools, setSchools] = useState([]);
  const defaultForm = {
    scholar_level_id: '',
    generation: '',
    group: '',
    grade: ''
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    getScholarLevels(i18n.language)
      .then(setScholarLevels)
      .catch(err => console.error('Error loading scholar levels:', err));
    getSchools(i18n.language,1)
      .then(setSchools)
      .catch(err => console.error('Error loading schools:', err));
  }, [i18n.language]);

  const handleChange = (key, value) => {
    setFormData(fd => ({ ...fd, [key]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // validate minimal:
    const missing = ['scholar_level_id','generation','group','grade']
      .find(k => !formData[k]);
    if (missing) {
      return swal(t('error'), t(`please_fill_${missing}`), 'warning');
    }
    await createClass(formData);

    // reset the form
    setFormData(defaultForm);
  };

  return (
    <>
      {canCreate && (
        <MDBBtn
          color="secondary"
          rippleColor="dark"
          style={{textWrap: "nowrap"}}
          onClick={() => setShow(true)}
        >
          <MDBIcon fas icon="add" className="me-1" />
          {t('create')}
        </MDBBtn>
      )}

      <MDBModal show={show} onClose={() => setShow(false)} tabIndex="-1">
        <form onSubmit={handleSubmit}>
          <MDBModalDialog size="lg">
            <MDBModalContent>
              <MDBModalHeader>
                <MDBModalTitle>{t('create_class')}</MDBModalTitle>
                <MDBBtn
                  className="btn-close"
                  type="button"
                  color="none"
                  onClick={() => setShow(false)}
                  disabled={isSaving}
                />
              </MDBModalHeader>

              <MDBModalBody>
                <MDBRow className="g-3">
                  <MDBCol size="6">
                    <label htmlFor="schoolSelect">
                      {t('school')}
                    </label>
                    <select
                      key="schoolSelector"
                      id="schoolSelect"
                      className="form-select"
                      value={formData.school_id}
                      onChange={e =>
                        handleChange('school_id', e.target.value)
                      }
                      disabled={isSaving}
                      required
                    >
                      <option value="">{"— "+t('select_option')+" —"}</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.school_id}>
                          {school.description}
                        </option>
                      ))}
                    </select>
                  </MDBCol>
                  <MDBCol size="6">
                    <label htmlFor="scholarLevelSelect">
                      {t('scholar_level')}
                    </label>
                    <select
                      key="schoolarLevelSelector"
                      id="scholarLevelSelect"
                      className="form-select"
                      value={formData.scholar_level_id}
                      onChange={e =>
                        handleChange('scholar_level_id', e.target.value)
                      }
                      disabled={isSaving}
                      required
                    >
                      <option value="">{"— "+t('select_option')+" —"}</option>
                      {scholarLevels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </MDBCol>

                  <MDBCol size="4">
                    <MDBInput
                      label={t('generation')}
                      value={formData.generation}
                      onChange={e =>
                        handleChange('generation', e.target.value)
                      }
                      required
                      disabled={isSaving}
                    />
                  </MDBCol>

                  <MDBCol size="4">
                    <MDBInput
                      label={t('grade')}
                      type="number"
                      value={formData.grade}
                      onChange={e => handleChange('grade', e.target.value)}
                      required
                      disabled={isSaving}
                    />
                  </MDBCol>

                  <MDBCol size="4">
                    <MDBInput
                      label={t('class')}
                      value={formData.group}
                      onChange={e => handleChange('group', e.target.value)}
                      required
                      disabled={isSaving}
                    />
                  </MDBCol>
                </MDBRow>
              </MDBModalBody>

              <MDBModalFooter>
                <MDBBtn
                  color="secondary"
                  type="button"
                  onClick={() => setShow(false)}
                  disabled={isSaving}
                >
                  {isSaving ? <MDBSpinner size="sm" /> : t('cancel')}
                </MDBBtn>
                <MDBBtn type="submit" color="primary" disabled={isSaving}>
                  {isSaving ? <MDBSpinner size="sm" /> : t('create')}
                </MDBBtn>
              </MDBModalFooter>
            </MDBModalContent>
          </MDBModalDialog>
        </form>
      </MDBModal>
    </>
  );
}
