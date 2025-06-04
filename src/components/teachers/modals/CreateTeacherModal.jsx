import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import useTeacherActions from '../../../hooks/teachers/useTeacherActions';
import { getSchools } from '../../../api/schoolsApi';
import FormModal from '../../modals/FormModal';

export default function CreateTeacherModal({ show, setShow, onSuccess }) {
  const { t, i18n } = useTranslation();
  const { isSaving, createTeacher } = useTeacherActions(() => {
    setShow(false);
    onSuccess();
  });

  const [schools, setSchools] = useState([]);
  const defaultForm = {
    scholar_level_id: '',
    generation: '',
    group: '',
    grade: ''
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    getSchools(i18n.language,1)
      .then(setSchools)
      .catch(err => console.error('Error loading schools:', err));
  }, [i18n.language]);

  const handleSubmit = async () => {
    // validate minimal:
    const missing = ['first_name','last_name_father','last_name_mother','username','password','school_id','email']
      .find(k => !formData[k]);
    if (missing) {
      return swal(t('error'), t(`please_fill_${missing}`), 'warning');
    }
    await createTeacher(formData);

    // reset the form
    setFormData(defaultForm);
  };

  // Add user form fields to pass to the modal component
  const addClassFormGroups = [
    {
      groupTitle: 'full_name',
      columns: 3,
      fields: [
        { key: 'first_name', label: 'first_name', type: 'text', required: true },
        { key: 'last_name_father', label: 'last_name_father', type: 'text', required: true },
        { key: 'last_name_mother', label: 'last_name_mother', type: 'text', required: true },
      ],
    },
    {
      groupTitle: 'user_info',
      columns: 2,
      fields: [
        { key: 'username', label: 'username', type: 'text', required: true },
        { key: 'password', label: 'password', type: 'password', required: true },
      ],
    },
    {
      groupTitle: 'general_info', // translation key for group title
      columns: 1,
      fields: [
        { 
          key: 'school_id', 
          label: 'school_id', 
          type: 'select',
          required: true,
          options: schools.map(school => ({
            value: school.school_id,
            label: school.description
          }))
        },
      ],
    },
    {
      groupTitle: 'additional_info',
      columns: 4,
      fields: [
        { key: 'birth_date', label: 'birth_date', type: 'date' },
        { key: 'phone_number', label: 'phone_number', type: 'text' },
        { key: 'tax_id', label: 'tax_id', type: 'text' },
        { key: 'curp', label: 'curp', type: 'text' },
      ],
    },
    {
      groupTitle: 'contact_and_address',
      columns: 4,
      fields: [
        { key: 'street', label: 'street', type: 'text' },
        { key: 'ext_number', label: 'ext_number', type: 'text' },
        { key: 'int_number', label: 'int_number', type: 'text' },
        { key: 'suburb', label: 'suburb', type: 'text' },
        { key: 'locality', label: 'locality', type: 'text' },
        { key: 'municipality', label: 'municipality', type: 'text' },
        { key: 'state', label: 'state', type: 'text' },
        { key: 'personal_email', label: 'personal_email', type: 'email' },
        { key: 'email', label: 'email', type: 'email', required: true },
        { key: 'phone_number', label: 'phone_number', type: 'tel' },
      ],
    }
  ];

  return (
    <>
      <FormModal
        show={show}
        setShow={setShow}
        formGroups={addClassFormGroups}
        data={formData}
        setData={setFormData}
        onSave={handleSubmit}
        title={t('add_teacher')}
        size="xl"
        idPrefix="create_"
        isSaving={isSaving}
      />
    </>
  );
}