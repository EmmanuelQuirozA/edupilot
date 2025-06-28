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
  MDBTextArea,
  MDBSwitch
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import useMenuActions from '../../../hooks/menu/useMenuActions';
// import { getScholarLevels } from '../../../api/studentApi';
// import { getSchools } from '../../../api/schoolsApi';
// import { useDropzone } from 'react-dropzone';
// import axios from 'axios';
// import api from '../../../api/api';
import MenuImageDropZone from '../MenuImageDropZone';

export default function EditMenuModal({ show, onClose, onSuccess, data }) {
  const { t, i18n } = useTranslation();
  const { isSaving, updateMenu, updateMenuStatus } = useMenuActions(onSuccess);
  const defaultForm = {
    code:        '',
    nameEs:     '',
    nameEn:     '',
    descriptionEs: '',
    descriptionEn: '',
    price:       '',
    image:       ''
  };
  const [formData, setFormData] = useState(defaultForm);

  // Whenever `data` changes (on open) populate the form
  useEffect(() => {
    if (!data) return;
    setFormData({
      code:            data.code || '',
      nameEs:         data.nameEs || '',
      nameEn:         data.nameEn || '',
      descriptionEs:  data.descriptionEs || '',
      descriptionEn:  data.descriptionEn || '',
      price:           data.price != null ? data.price : '',
      image:           data.image || ''
    });
  }, [data]);

  const handleChange = (key, val) => {
    setFormData(fd => ({ ...fd, [key]: val }));
  };

  const handleImageSet = filename => {
    setFormData(fd => ({ ...fd, image: filename }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const missing = ['code', 'price', 'nameEs', 'nameEn']
      .find(k => !formData[k]);
    if (missing) {
      return swal('Error', t(`please_fill_${missing}`), 'warning');
    }

    try {
      const payload = new FormData();

    // Attach JSON as a Blob
      payload.append(
        'request',
        new Blob(
          [JSON.stringify({
          code:           formData.code,
          nameEs:        formData.nameEs,
          nameEn:        formData.nameEn,
          descriptionEs: formData.descriptionEs,
          descriptionEn: formData.descriptionEn,
          price:          parseFloat(formData.price),
          image:          formData.image
          })],
          { type: 'application/json' }
        )
      );
      
      await updateMenu(data.menuId, payload, i18n.language);

      setFormData(defaultForm);
    } catch (err) {
      console.error(err);
      swal(t('error'), t('failed_to_update_menu'), 'error'); // replace or customize
    }
  };

  const handleStatusSwitchChange  = async e => {
    e.preventDefault();

    try {
      await updateMenuStatus(data.menuId, i18n.language);
    } catch (err) {
      console.error(err);
      swal(t('error'), t('failed_to_update_status'), 'error'); // replace or customize
    }
  }

  // const [scholarLevels, setScholarLevels] = useState([]);
  // const [schools, setSchools] = useState([]);
  
  // useEffect(() => {
  //   getScholarLevels(i18n.language)
  //     .then(setScholarLevels)
  //     .catch(err => console.error('Error loading scholar levels:', err));
  //   getSchools(i18n.language,1)
  //     .then(setSchools)
  //     .catch(err => console.error('Error loading schools:', err));
  // }, [i18n.language]);

  return (
    <>
      <MDBModal open={show} onClose={onClose}>
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <form onSubmit={handleSubmit}>
              <MDBModalHeader>
                <MDBModalTitle>{t('update_menu')}</MDBModalTitle>
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
                      <MenuImageDropZone
                        menuId={data.menuId}
                        currentFilename={data.image}
                        onImageSet={handleImageSet}
                        t={t}
                        lang={i18n.language}
                      />
                    </MDBCol>
                  </MDBCol>
                </MDBRow>
              </MDBModalBody>

              <MDBModalFooter>
                <MDBSwitch
                  id="statusSwitch"
                  label={t('change_status')}
                  checked={data?.enabled}
                  onChange={handleStatusSwitchChange}
                  disabled={isSaving}
                />
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