// src/hooks/classes/useClassActions.js
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import api from '../../api/api';   // your axios instance with auth interceptor

/**
 * @param {() => void} onSuccess  callback to refresh your classes list
 */
export default function useClassActions(onSuccess) {
  const { t, i18n } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Update class details
   * @param {object} selectedClass
   */
  const updateClass = async (selectedClass) => {
    setIsSaving(true);
    try {
      const {
        group_id,
        scholar_level_id,
        generation,
        group,
        grade
      } = selectedClass;

      const { data: resData } = await api.put(
        `/api/groups/update/${group_id}`,
        { scholar_level_id, generation, group, grade },
        { params: { lang: i18n.language } }
      );

      swal(resData.title, resData.message, resData.type);
      if (resData.success !== false) {
        onSuccess();
      }
    } catch (err) {
      swal(t('error_title'), t('update_failed'), 'error');
      console.error('Error updating class:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Confirm and toggle class status
   * @param {object} selectedClass
   */
  const changeClassStatus = async (selectedClass) => {
    const { group_id } = selectedClass;
    const willChange = await swal({
      title: t('change_status_confirm_title'),
      text:  t('change_status_confirm_text'),
      icon:  'warning',
      buttons: [t('cancel'), t('confirm')],
      dangerMode: true,
    });

    if (!willChange) {
      // canceled: just reload to reset UI
      onSuccess();
      return;
    }

    setIsSaving(true);
    try {
      const { data: resData } = await api.post(
        `/api/groups/update/${group_id}/status`,
        {},
        { params: { lang: i18n.language } }
      );

      swal(resData.title, resData.message, resData.type);
      if (resData.success !== false) {
        onSuccess();
      }
    } catch (err) {
      swal(t('error_title'), t('update_failed'), 'error');
      console.error('Error updating class status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Create a new class
   * @param {{scholar_level_id, name, generation, group, grade}} newClass
   */
  const createClass = async (newClass) => {
    setIsSaving(true);
    try {
      const { data: resData } = await api.post(
        '/api/groups/create',
        newClass,
        { params: { lang: i18n.language } }
      );
      swal(resData.title, resData.message, resData.type);
      if (resData.success !== false) {
        onSuccess();
      }
    } catch (err) {
      swal(t('error_title'), t('create_failed'), 'error');
      console.error('Error creating class:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    updateClass,
    changeClassStatus,
    createClass
  };
}
