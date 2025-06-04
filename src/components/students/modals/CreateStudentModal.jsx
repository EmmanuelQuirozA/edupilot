// src/components/students/modals/CreateStudentModal.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import FormModal from '../../modals/FormModal';
import MassUploadContent from '../components/MassUploadContent';
import { createStudents } from '../../../api/studentsApi';
import { getSchools } from '../../../api/schoolsApi';
import { getClasses } from '../../../api/classesApi';

export default function CreateStudentModal({ show, setShow, onSuccess }) {
  const { t, i18n } = useTranslation();

  const [schools, setSchools] = useState([]);
	const [classes, setClasses] = useState([]);


  // form data for single‐student
  const [formData, setFormData] = useState({
    first_name:        '',
    last_name_father:  '',
    last_name_mother:  '',
    birth_date:        '',
    phone_number:      '',
    tax_id:            '',
    curp:              '',
    street:            '',
    ext_number:        '',
    int_number:        '',
    suburb:            '',
    locality:          '',
    municipality:      '',
    state:             '',
    personal_email:    '',
    image:             null,
    email:             '',
    username:          '',
    password:          '',
    school_id:         '',  // will be set by parent or user
    group_id:          '',
    register_id:       '',
    payment_reference: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSchools(i18n.language,1)
      .then(setSchools)
      .catch(err => console.error('Error loading schools:', err));
  }, [i18n.language]);

  // Helper function to fetch classes based on school_id
	const fetchClassesForSchool = async  (schoolId) => {
    if (!schoolId) {
        setClasses([]);
        return;
    }
    const resp = await getClasses({
      school_id: schoolId,
      status_filter: true,
      lang: i18n.language,
      export_all: true
    });
    return (setClasses(resp.content))
  };

	// When adding a new student, fetch classes when formData.school_id changes
	useEffect(() => {
			if (formData.school_id) {
				// Clear previous classes
				setClasses([]);
				fetchClassesForSchool(formData.school_id);
			} else {
				setClasses([]);
			}
		}, [formData.school_id, i18n.language]);

  // Single‐student submit handler
  const handleSingleSubmit = async () => {
    setIsSaving(true);
    let didCreate = false;

    try {
      const payload = [{ ...formData, role_id: 4 }];
      const res = await createStudents(payload, i18n.language);

      if (res.success === true) {
        swal(res.title, res.message, 'success');
        setShow(false);
        didCreate = true;
      } else {
        swal(res.title, res.message, res.type || 'warning');
      }
    } catch (err) {
      console.error(err);
      swal(t('error_title'), t('create_failed'), 'error');
    } finally {
      setIsSaving(false);
      // Only call onSuccess if we truly created
      if (didCreate) {
        try {
          onSuccess();
        } catch (err2) {
          console.error('Error in onSuccess():', err2);
        }
      }
    }
  };

  // Mass‐upload success handler
  const handleMassUploadSuccess = () => {
    onSuccess();
    setShow(false);
  };

	const singleFormGroups = [
    {
      groupTitle: 'name',
      columns: 3,
      fields: [
        { key: 'first_name',       label: 'first_name',       type: 'text', required: true },
        { key: 'last_name_father', label: 'last_name_father', type: 'text', required: true },
        { key: 'last_name_mother', label: 'last_name_mother', type: 'text', required: true }
      ]
    },
    {
      groupTitle: 'user_info',
      columns: 3,
      fields: [
        { key: 'email',            label: 'email',            type: 'email', required: true },
        { key: 'username',         label: 'username',         type: 'text',  required: true },
        { key: 'password',         label: 'password',         type: 'password', required: true }
      ]
    },
		{
			groupTitle: 'general_info', // translation key for group title
			columns: 2,
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
				{ 
					key: 'group_id', 
					label: 'group_id', 
					type: 'select',
					required: true,
					options: classes.map(group => ({
						value: group.group_id,
						label: group.generation+" | "+group.scholar_level_name+" | "+group.grade_group
					}))
				},
			],
		},
		{
			groupTitle: 'student_info',
			columns: 2,
			fields: [
				{ key: 'register_id', label: 'register_id', type: 'text', required: true},
				{ key: 'payment_reference', label: 'payment_reference', type: 'text', required: true },
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
				{ key: 'phone_number', label: 'phone_number', type: 'tel' },
			],
		}
	];


  return (
    <FormModal
      show={show}
      setShow={setShow}
      formGroups={singleFormGroups}
      data={formData}
      setData={setFormData}
      onSave={handleSingleSubmit}
      title={t('add_student')}
      size="xl"
      idPrefix="create_"
      isSaving={isSaving}
      mass_upload={true}
      mass_component={
        <MassUploadContent
          school_id={formData.school_id}
          group_id={formData.group_id}
          onUploadSuccess={handleMassUploadSuccess}
          onClose={() => setShow(false)}
        />
      }
    />
  );
}
