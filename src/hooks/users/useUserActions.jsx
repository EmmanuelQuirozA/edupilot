// src/hooks/users/useUserActions.js
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert';
import api from '../../api/api';   // axios instance with auth interceptor

/**
 * @param {() => void} onSuccess  callback to refresh users list
 */
export default function useUserActions(onSuccess) {
  const { t, i18n } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Update user details
   * @param {object} selectedUser
   */
  const updateUser = async (selectedUser) => {
    setIsSaving(true);
    try {
      const {
        group_id,
        scholar_level_id,
        generation,
        group,
        grade
      } = selectedUser;

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
      console.error('Error updating user:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Confirm and toggle user status
   * @param {object} selectedUser
   */
  const changeUserStatus = async (selectedUser) => {
    const { group_id } = selectedUser;
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
      console.error('Error updating user status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const createUser = async (newUser) => {
    setIsSaving(true);

    let resData;
    try {
      const { data } = await api.post(
        '/api/users/create',
        newUser,
        { params: { lang: i18n.language } }
      );
      resData = data;
    } catch (err) {
      console.error('Error creating user:', err);
      swal(t('error_title'), t('create_failed'), 'error');
      setIsSaving(false);
      return;
    }

    // If we got here, the HTTP request itself succeeded:
    swal(resData.title, resData.message, resData.type);

    if (resData.success !== false) {
      // Call onSuccess (e.g. reload + close modal). Wrap it in try/catch
      try {
        onSuccess();
      } catch (err2) {
        console.error('Error in onSuccess callback:', err2);
        // (optional) you could show a separate alert, or simply swallow
      }
    }

    setIsSaving(false);
  };

  return {
    isSaving,
    updateUser,
    changeUserStatus,
    createUser
  };
}
