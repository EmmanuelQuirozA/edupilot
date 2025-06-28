import React, { useState, useEffect } from 'react';
import {
  MDBBtn,
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
  MDBSpinner,
  MDBTextArea
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import useMenuActions from '../../../hooks/menu/useMenuActions';
import { getSchools } from '../../../api/schoolsApi';
import MenuImageUploadDropZone from '../MenuImageUploadDropZone';

export default function CreateMenuButton({ show, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const { isSaving, createMenu } = useMenuActions(onSuccess);
  const [schools, setSchools] = useState([]);
  const defaultForm = {
    schoolId: '',
    code: '',
    nameEs: '',
    nameEn: '',
    descriptionEs: '',
    descriptionEn: '',
    price: '',
    imageFile: null
  };

  const [formData, setFormData] = useState(defaultForm);

  // useEffect(() => {
  //   getSchools(i18n.language,1)
  //     .then(setSchools)
  //     .catch(err => console.error('Error loading schools:', err));
  // }, [i18n.language]);

  useEffect(() => {
    getSchools(i18n.language, 1)
      .then(data => {
        setSchools(data);

        if (data.length > 0) {
          setFormData(fd => ({
            ...fd,
            schoolId: data[0].school_id
          }));
        }
      })
      .catch(err => console.error('Error loading schools:', err));
  }, [i18n.language]);

  const handleChange = (key, value) => {
    setFormData(fd => ({ ...fd, [key]: value }));
  };

  const handleImageSet = (filename, file) => {
    setFormData(fd => ({ ...fd, imageFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = ['schoolId', 'code', 'price', 'nameEs', 'nameEn'].find(k => !formData[k]);
    if (missing) {
      return swal(t('error'), t(`please_fill_${missing}`), 'warning');
    }

    try {
      const form = new FormData();
      const jsonPayload = {
        schoolId:      formData.schoolId,
        code:          formData.code,
        nameEs:        formData.nameEs,
        nameEn:        formData.nameEn,
        descriptionEs: formData.descriptionEs,
        descriptionEn: formData.descriptionEn,
        price:         parseFloat(formData.price),
        enabled:       true
      };

      form.append(
        'request',
        new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' })
      );

      if (formData.imageFile) {
        form.append('image', formData.imageFile);
      }

      await createMenu(form,i18n.language); // Should be handled in your `useMenuActions`

      setFormData(defaultForm);
      onClose();
    } catch (err) {
      console.error(err);
      swal(t('error'), t('failed_to_create_menu'), 'error');
    }
  };


  return (
    <>
      <MDBModal open={show} onClose={onClose}>
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <form onSubmit={handleSubmit}>
              <MDBModalHeader>
                <MDBModalTitle>{t('create')}</MDBModalTitle>
                <MDBBtn
                  className="btn-close"
                  type="button"
                  color="none"
                  onClick={onClose}
                  disabled={isSaving}
                />
              </MDBModalHeader>

              <MDBModalBody>
                <MDBRow className="mb-3 g-3">
                  <MDBCol size="8">
                    <h5>{t('details')}</h5>
                    <MDBCol size="12" className='pb-4'>
                      <label htmlFor="schoolSelect">
                        {t('school')}
                      </label>
                      <select
                        id="schoolSelect"
                        className="form-select"
                        value={formData.schoolId}
                        onChange={e =>
                          handleChange('schoolId', Number(e.target.value)) // Cast to number if needed
                        }
                        disabled={isSaving}
                        required
                      >
                        {schools.map(school => (
                          <option key={school.school_id} value={school.school_id}>
                            {school.description}
                          </option>
                        ))}
                      </select>
                    </MDBCol>
                    <MDBRow className="mb-3 g-3">
                      <MDBCol size="6">
                        <MDBInput
                          label={t('code')}
                          value={formData.code}
                          onChange={e => handleChange('code', e.target.value)}
                          required
                          disabled={isSaving}
                        />
                      </MDBCol>

                      <MDBCol size="6">
                        <MDBInput
                          label={t('price')}
                          type="number"
                          value={formData.price}
                          onChange={e => handleChange('price', e.target.value)}
                          required
                          disabled={isSaving}
                        />
                      </MDBCol>
                    </MDBRow>
                    <MDBRow className="g-3">

                    <MDBCol size="6">
                      <h5>{t('spanish')}</h5>
                      <MDBCol className="mb-3 g-3">
                        <MDBInput
                          label={t('name_es')}
                          value={formData.nameEs}
                          onChange={e => handleChange('nameEs', e.target.value)}
                          required
                          disabled={isSaving}
                        />
                      </MDBCol>
                      <MDBTextArea
                      label={t('description_es')+" "+t('optional')}
                      rows={4}
                      value={formData.descriptionEs}
                      onChange={e => handleChange('descriptionEs', e.target.value)}
                      disabled={isSaving}
                      />
                    </MDBCol>

                    <MDBCol size="6">
                      <h5>{t('english')}</h5>
                      <MDBCol className="mb-3 g-3">
                        <MDBInput
                          label={t('name_en')}
                          value={formData.nameEn}
                          onChange={e => handleChange('nameEn', e.target.value)}
                          required
                          disabled={isSaving}
                        />
                      </MDBCol>
                      <MDBTextArea
                      label={t('description_en')+" "+t('optional')}
                      rows={4}
                      value={formData.descriptionEn}
                      onChange={e => handleChange('descriptionEn', e.target.value)}
                      disabled={isSaving}
                      />
                    </MDBCol>

                  </MDBRow>

                  </MDBCol>
                  <MDBCol size="4">
                    <h5>{t('upload_image')}</h5>
                    <MDBCol md="12" style={{height:'100%', alignContent:'center'}}>
                      <MenuImageUploadDropZone onImageSet={handleImageSet} />
                    </MDBCol>
                  </MDBCol>
                </MDBRow>
              </MDBModalBody>

              <MDBModalFooter>
                <MDBBtn
                  color="secondary"
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  {isSaving ? <MDBSpinner size="sm" /> : t('cancel')}
                </MDBBtn>
                <MDBBtn type="submit" color="primary" disabled={isSaving}>
                  {isSaving ? <MDBSpinner size="sm" /> : t('save')}
                </MDBBtn>
              </MDBModalFooter>
            </form>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}