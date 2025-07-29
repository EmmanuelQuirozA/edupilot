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
import { getPaymentConcepts } from '../../../api/studentApi';
import { getStudents } from '../../../api/studentsApi';
import { getSchools } from '../../../api/schoolsApi';
import { getClasses } from '../../../api/classesApi';
import AsyncSearchableSelect from '../../common/AsyncSearchableSelect';
import { validateExistence, createPaymentRequest, createRecurringPaymentRequest } from '../../../api/paymentRequestsApi';

export default function CreatePaymentRequestModal({ show, setShow, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    school_id: '',
    group_id: '',
    student_id: '',
    payment_concept_id: '',
    amount: '',
    pay_by: '',
    comments: '',
    late_fee: '',
    fee_type: '$',
    late_fee_frequency: '',
    payment_month: '',
    partial_payment: false
  });
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    period: 'DAILY',
    interval_count: '',
    start_date: '',
    end_date: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [createFor, setCreateFor] = useState('school');

  const [paymentConcepts, setPaymentConcepts] = useState([]);
  const [classes,         setClasses]         = useState([]);
  const [schools,         setSchools]         = useState([]);

  const [isLoadingSchools, setIsLoadingSchools]   = useState(false);
  const [isLoadingClasses, setIsLoadingClasses]   = useState(false);
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);

  // fetch schools once
  useEffect(() => {
    setIsLoadingSchools(true);
    getSchools(i18n.language)
      .then((data) => setSchools(data))   
      .catch((err) => {
        console.error('Error loading schools:', err);
        swal(t('error'), t('failed_to_load_data'), 'error');
      })
      .finally(() => setIsLoadingSchools(false));
  }, [i18n.language, t]);

  // fetch classes once
  useEffect(() => {
    setIsLoadingClasses(true);

    getClasses({
      enabled: true,
      lang: i18n.language,
      // || pass additional filters or pagination here ||
      export_all: true // fetch all so you can search through them
    })
      .then((resp) => {
        // your API returns an object, e.g. { content: [ … ], totalElements: 123, … }
        setClasses(resp.content || []);
      })
      .catch((err) => {
        console.error('Error loading classes:', err);
        swal(t('error'), t('failed_to_load_data'), 'error');
      })
      .finally(() => {
        setIsLoadingClasses(false);
      });
  }, [i18n.language, t]);

  // fetch payment concepts once
  useEffect(() => {
    setIsLoadingConcepts(true);
    getPaymentConcepts(i18n.language)
      .then((data) => setPaymentConcepts(data))   
      .catch((err) => {
        console.error('Error loading payment concepts:', err);
        swal(t('error'), t('failed_to_load_data'), 'error');
      })
      .finally(() => setIsLoadingConcepts(false));
  }, [i18n.language, t]);

  const handleCreateForChange = (e) => {
    const value = e.target.value;
    setCreateFor(value);

    // Reset all three selects—whichever was selected previously gets cleared
    setFormData((prev) => ({
      ...prev,
      school_id: '',
      payment_concept_id: '',
      student_id: ''
    }));
  };

  // loadOptions function for the select:
  const loadStudentOptions = async (fullNameFilter) => {
    try {
      const resp = await getStudents({
        full_name: fullNameFilter,
        status_filter: true,
        lang: i18n.language,
      });
      // resp.content is your array of student objects
      return (resp.content || []).map((s) => ({
        value: s.student_id,
        label: s.full_name
      }));
    } catch (err) {
      console.error('Error in loadStudentOptions:', err);
      return [];
    }
  };

  const handleChange = (key, value) => {
    setFormData(fd => ({ ...fd, [key]: value }));
  };

  const handleScheduleChange = (key, value) => {
    setScheduleData(sd => ({ ...sd, [key]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // 1) Validate required fields (except school_id / group_id / student_id,
    //    since only one of those is required depending on createFor)
    const missing = [
      'payment_concept_id',
      'amount',
      'pay_by',
      'fee_type',
      'late_fee',
      'late_fee_frequency',
      'partial_payment'
    ].find((k) => {
      const val = formData[k];
      // partial_payment is boolean, and fee_type must be non‐empty string
      if (k === 'partial_payment' || k === 'fee_type') {
        return val === undefined || val === null || String(val).trim() === '';
      }
      // for everything else, reject empty string or undefined/null
      return val === undefined || val === null || String(val).trim() === '';
    });

    // 2) Validate existence (only if createFor is school or group)
    if (missing) {
      return swal(
        t('error'),
        t('please_complete_data') + ': ' + t(missing),
        'warning'
      );
    }

    // 2) Validate existence (only if createFor is school or group)
    let existsList = [];
    if (createFor === 'school' || createFor === 'class') {
      try {
        existsList = await validateExistence({
          school_id:          createFor === 'school' ? formData.school_id : undefined,
          group_id:           createFor === 'class'  ? formData.group_id  : undefined,
          payment_concept_id: formData.payment_concept_id,
          payment_month:      formData.payment_month || undefined
        });
      } catch (err) {
        console.error(err);
        return swal(t('error'), t('validation_failed'), 'error');
      }
    }

      // 3) If any existing students returned, show a confirm dialog with their list
    if (Array.isArray(existsList) && existsList.length > 0) {
      const htmlList = `
        <ul style="text-align: left; margin: 0; padding-left: 1.2em; max-height: 40vh; overflow: auto;">
        ${existsList
          .map(s => `<li>${s.student_id} – ${s.full_name}</li>`)
            .join('')}
        </ul>
      `;
      const willContinue = await swal({
        title: t('existing_pr_confirm_title'),        // e.g. “Ya existen solicitudes…”
        text:  t('existing_pr_confirm_text'),          // e.g. “Estos alumnos ya tienen… ¿Desea continuar?”
        content: {
          element: 'div',
          attributes: {
            innerHTML: htmlList
          }
        },
        icon:    'warning',
        buttons: [t('cancel'), t('continue')],         // e.g. “Cancelar” / “Continuar”
        dangerMode: false
      });

      if (!willContinue) {
        // User clicked “Cancelar” → just close or reload
        onSuccess();
        return;
      }
      // If user clicked “Continuar,” fall through to creation
    }

      // 4) Now actually create the payment request(s)
      setIsSaving(true);
    try {
      // Build payload—include exactly one of school_id, group_id, student_id
      const payload = {
        payment_concept_id:  formData.payment_concept_id,
        amount:              parseFloat(formData.amount),
        pay_by:              formData.pay_by,           // “YYYY-MM-DD”
        comments:            formData.comments || '',
        late_fee:            parseFloat(formData.late_fee),
        fee_type:            formData.fee_type,
        late_fee_frequency:  parseInt(formData.late_fee_frequency, 10),
        payment_month:       formData.payment_month,     // “YYYY-MM”
        partial_payment:     Boolean(formData.partial_payment)
      };
      if (createFor === 'school')  payload.school_id  = formData.school_id;
      if (createFor === 'class')   payload.group_id   = formData.group_id;
      if (createFor === 'student') payload.student_id = formData.student_id?.value;

      let createdList = [];
      if (scheduleEnabled) {
        createdList = await createRecurringPaymentRequest({
          ...payload,
          ...scheduleData
        });
      } else {
        createdList = await createPaymentRequest(payload);
      }
      // createdList is an array like:
      // [ { payment_request_id: 65, full_name: "FRANCISCO AGUILAR GONZALEZ" }, … ]

      if (Array.isArray(createdList) && createdList.length > 0) {
        const htmlCreated = `
          <ul style="text-align: left; margin: 0; padding-left: 1.2em; max-height: 40vh; overflow: auto;">
            ${createdList
              .map(pr => `<li>${pr.payment_request_id} – ${pr.full_name}</li>`)
              .join('')}
          </ul>
        `;
        await swal({
          title: t('pr_created_title'),         // e.g. “Solicitudes creadas:”
          content: {
            element: 'div',
            attributes: { innerHTML: htmlCreated }
          },
          icon:    'success',
          button:  t('ok')
        });
      } else {
        // If server returns an empty array for some reason, just show a generic success
        swal(t('success'), t('pr_created_generic'), 'success');
      }

      // 5) Reset form & close (via onSuccess in parent)
      setFormData({
        school_id: '',
        group_id: '',
        student_id: '',
        payment_concept_id: '',
        amount: '',
        pay_by: '',
        comments: '',
        late_fee: '',
        fee_type: '$',
        late_fee_frequency: '',
        payment_month: '',
        partial_payment: false
      });
      setScheduleEnabled(false);
      setScheduleData({
        period: 'DAILY',
        interval_count: '',
        start_date: '',
        end_date: ''
      });
      onSuccess();
      setShow(false);
    } catch (err) {
      console.error('Error creating payment request:', err);
      swal(t('error'), t('create_payment_request_failed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <MDBModal open={show} onClose={() => setShow(false)} tabIndex="-1">
        <MDBModalDialog size="xl">
          <MDBModalContent>
            <form onSubmit={handleSubmit}>
              <MDBModalHeader>
                <MDBModalTitle>{t('create_payment_request')}</MDBModalTitle>
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
                  {/* ── Main “Create For” radios ─────────────────────── */}
                  <MDBCol size="12" className="mb-3">
                    <label className="form-label">{t('create_for')}</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="radioSchool"
                          value="school"
                          checked={createFor === 'school'}
                          onChange={handleCreateForChange}
                          disabled={isSaving}
                        />
                        <label className="form-check-label" htmlFor="radioSchool">
                          {t('school')}
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="radioClass"
                          value="class"
                          checked={createFor === 'class'}
                          onChange={handleCreateForChange}
                          disabled={isSaving}
                        />
                        <label className="form-check-label" htmlFor="radioClass">
                          {t('class')}
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="radioStudent"
                          value="student"
                          checked={createFor === 'student'}
                          onChange={handleCreateForChange}
                          disabled={isSaving}
                        />
                        <label className="form-check-label" htmlFor="radioStudent">
                          {t('student')}
                        </label>
                      </div>
                    </div>
                  </MDBCol>

                  {/* ── Conditionally show exactly one of these three ──────────────────── */}
                  {createFor === 'school' && (
                    <MDBCol size="3" className="mb-3">
                      <label htmlFor="schoolSelect">{t('school')}</label>
                      {isLoadingSchools ? (
                        <div className="d-flex align-items-center">
                          <MDBSpinner size="sm" />&nbsp;{t('loading_schools')}
                        </div>
                      ) : (
                        <select
                          id="schoolSelect"
                          className="form-select"
                          onChange={(e) =>
                            handleChange('school_id', e.target.value)
                          }
                          disabled={isSaving}
                          required
                        >
                          <option value="">
                            {`— ${t('select_option')} —`}
                          </option>
                          {schools.map((s) => (
                            <option key={s.school_id} value={s.school_id}>
                              {s.description}
                            </option>
                          ))}
                        </select>
                      )}
                    </MDBCol>
                  )}

                  {createFor === 'class' && (
                    <MDBCol size="3" className="mb-3">
                      <label htmlFor="paymentClassesSelect">
                        {t('classes')}
                      </label>
                      {isLoadingClasses ? (
                        <div className="d-flex align-items-center">
                          <MDBSpinner size="sm" />&nbsp;{t('loading')}
                        </div>
                      ) : (
                        <select
                          id="classSelect"
                          className="form-select"
                          onChange={(e) => handleChange('group_id', e.target.value)}
                          required
                        >
                          <option value="">{`— ${t('select_option')} —`}</option>
                          {classes.map((s) => (
                            <option key={s.group_id} value={s.group_id}>
                              {s.generation + ' | ' + s.grade_group}
                            </option>
                          ))}
                        </select>
                      )}
                    </MDBCol>
                  )}

                  {createFor === 'student' && (
                    <MDBCol size="3" className="mb-3">
                      <label>{t('student')}</label>
                      <AsyncSearchableSelect
                        id="studentSelect"
                        value={formData.student_id}
                        loadOptions={loadStudentOptions}
                        onChange={(val) => handleChange('student_id', val)}
                        placeholder={t('search_by_name')}
                        disabled={isSaving}
                      />
                    </MDBCol>
                  )}

                  {/*  */}
                  <MDBCol size="3">
                    <label htmlFor="payment_concept">
                      {t('payment_concept')}
                    </label>
                    
                    {isLoadingConcepts ? (
                      <div className="d-flex align-items-center">
                        <MDBSpinner size="sm" />&nbsp;{t('loading')}
                      </div>
                    ) : (
                      <select
                        id="payment_concept"
                        className="form-select"
                        onChange={e =>
                          handleChange('payment_concept_id', e.target.value)
                        }
                        disabled={isSaving}
                        required
                      >
                        <option value="">{"— "+t('select_option')+" —"}</option>
                        {paymentConcepts.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </MDBCol>
                  <MDBCol size="3">
                    <label htmlFor="partial_payment">
                      {t('partial_payment')}
                    </label>
                    <select
                      id="partial_payment"
                      className="form-select"
                      value={String(formData.partial_payment)}             // ← controlled value
                      onChange={e =>
                        handleChange(
                          'partial_payment',
                          e.target.value === 'true'                        // convert back to boolean
                        )
                      }
                      style={{ minWidth: '62px' }}
                    >
                      <option value={false}>{t('no')}</option>
                      <option value={true}>{t('yes')}</option>
                    </select>
                  </MDBCol>
                  <h5>{t("details")}</h5>
                  <MDBCol size="4">
                    <div className="input-group mb-3">
                      <MDBInput
                        name="amount"
                        label={t('amount')}
                        type="number"
                        required
                        className="form-control"
                        onChange={e =>
                          handleChange('amount', e.target.value)
                        }
                        min={0}
                      />
                    </div>
                  </MDBCol>
                  <MDBCol size="4">
                    <div className="input-group mb-3">
                      <MDBInput
                        id="late_fee"
                        name="late_fee"
                        label={t('fee_amount')}
                        type="number"
                        required
                        className="form-control"
                        onChange={e =>
                          handleChange('late_fee', e.target.value)
                        }
                        min={0}
                      />
                      <select
                        id="fee_type"
                        className="form-select"
                        onChange={e =>
                          handleChange(
                            'fee_type',
                            e.target.value === 'true'                        // convert back to boolean
                          )
                        }
                        style={{ minWidth: '62px' }}
                      >
                        <option value="$">$</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                  </MDBCol>
                  <MDBCol size="4">
                    <div className="input-group mb-3">
                      <MDBInput
                        name="late_fee_frequency"
                        label={t('late_fee_frequency')}
                        type="number"
                        required
                        className="form-control"
                        onChange={e =>
                          handleChange('late_fee_frequency', e.target.value)
                        }
                        min={0}
                      />
                    </div>
                  </MDBCol>
                  <MDBCol size="6">
                    <div className="input-group mb-3">
                      <MDBInput
                        name="pay_by"
                        label={t('pay_by')}
                        type="date"
                        required
                        className="form-control"
                        onChange={e =>
                          handleChange('pay_by', e.target.value)
                        }
                      />
                    </div>
                  </MDBCol>
                  <MDBCol size="6">
                    <div className="input-group mb-3">
                      <MDBInput
                        name="payment_month"
                        label={t('payment_month')}
                        type="month"
                        className="form-control"
                        onChange={e =>
                          handleChange('payment_month', e.target.value)
                        }
                      />
                    </div>
                  </MDBCol>
                  <MDBCol size="12">
                    <div className="input-group mb-3">
                      <MDBTextArea
                        name="comments"
                        label={t('comments')}
                        type="textarea"
                        className="form-control"
                        onChange={e =>
                          handleChange('comments', e.target.value)
                        }
                      />
                    </div>
                  </MDBCol>

                  <MDBCol size="12">
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="scheduleSwitch"
                        checked={scheduleEnabled}
                        onChange={e => setScheduleEnabled(e.target.checked)}
                        disabled={isSaving}
                      />
                      <label className="form-check-label" htmlFor="scheduleSwitch">
                        Agendar solicitud de pago
                      </label>
                    </div>
                  </MDBCol>

                  {scheduleEnabled && (
                    <>
                      <MDBCol size="6">
                        <label htmlFor="periodSelect">Frecuencia de la solicitud</label>
                        <select
                          id="periodSelect"
                          className="form-select"
                          value={scheduleData.period}
                          onChange={e => handleScheduleChange('period', e.target.value)}
                          disabled={isSaving}
                        >
                          <option value="DAILY">Diario</option>
                          <option value="WEEKLY">Semanal</option>
                          <option value="MONTHLY">Mensual</option>
                          <option value="YEARLY">Anual</option>
                        </select>
                      </MDBCol>
                      <MDBCol size="6">
                        <MDBInput
                          label="Periodo"
                          type="number"
                          min="1"
                          step="1"
                          value={scheduleData.interval_count}
                          onChange={e => handleScheduleChange('interval_count', e.target.value)}
                        />
                      </MDBCol>
                      <MDBCol size="6">
                        <MDBInput
                          label="Fecha de inicio"
                          type="date"
                          value={scheduleData.start_date}
                          onChange={e => handleScheduleChange('start_date', e.target.value)}
                        />
                      </MDBCol>
                      <MDBCol size="6">
                        <MDBInput
                          label="Fecha de fin"
                          type="date"
                          value={scheduleData.end_date}
                          onChange={e => handleScheduleChange('end_date', e.target.value)}
                        />
                      </MDBCol>
                    </>
                  )}
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
            </form>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}