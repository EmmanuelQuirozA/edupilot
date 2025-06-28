// src/hooks/menu/useMenuActions.js
import { useState } from 'react';
import api from '../../api/api';
import swal from 'sweetalert';

export default function useMenuActions(onSuccess) {
  const [isSaving, setSaving] = useState(false);

  const updateMenu = async (menuId, payload, lang) => {
    setSaving(true);
    try {
      const res = await api.put(
        `/api/coffee/update/${menuId}`,
        payload,
        { params: { lang } }
      );
      console.log(res)
      swal(res.data.title, res.data.message, res.data.type);
      if (res.data.success !== false) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating menu:', err);
      swal('Error', 'Failed to update menu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateMenuStatus = async (menuId, lang) => {
    setSaving(true);
    try {
      const res = await api.post(
        `/api/coffee/update/${menuId}/status`,
        { params: { lang } }
      );
      console.log(res)
      swal(res.data.title, res.data.message, res.data.type);
      if (res.data.success !== false) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating menu:', err);
      swal('Error', 'Failed to update menu', 'error');
    } finally {
      setSaving(false);
    }

  }

  const createMenu = async (formData, lang) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/coffee/create?lang=${lang}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log(res)
      swal(res.data.title, res.data.message, res.data.type);
      if (res.data.success !== false) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating menu:', err);
      swal('Error', 'Failed to update menu', 'error');
    } finally {
      setSaving(false);
    }

  }

  

  return { isSaving, updateMenu, updateMenuStatus, createMenu };
}
