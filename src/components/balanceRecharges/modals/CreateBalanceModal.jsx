import React, { useState } from 'react';
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBRow,
  MDBCol,
  MDBSpinner
} from 'mdb-react-ui-kit';
import swal from 'sweetalert';
import { useTranslation } from 'react-i18next';
import AsyncSearchableSelect from '../../common/AsyncSearchableSelect';
import { getUserBalances } from '../../../api/coffeeApi';
import api from '../../../api/api';

export default function RechargeBalanceModal({ show, setShow, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadUserOptions = async (searchText) => {
    try {
      const users = await getUserBalances(searchText, i18n.language);
      
      return users.map(u => ({
        value: u.user_id,
        label: `${u.full_name} (Bal. ${u.balance.toFixed(2)})`,
        balance: u.balance
      }));
    } catch {
      return [];
    }
  };

  const handleRecharge = async (amount) => {
    if (!selectedUser) {
      return swal(t('error'), t('please_select_user'), 'warning');
    }

    const confirmed = await swal({
      title: t('confirm'),
      text: t('confirm_recharge_amount', { amount }),
      icon: 'warning',
      buttons: [t('cancel'), t('confirm')],
      dangerMode: false
    });

    if (!confirmed) return;

    setIsSaving(true);
    try {
      const res = await api.post('/api/balances/recharge', {
        userId: selectedUser.value,
        ticket: 0,
        amount: parseFloat(amount)
      }, {
        params: { lang: i18n.language }
      });

      swal(res.data.title, res.data.message, res.data.type);
      if (res.data.success !== false) {
        setShow(false);
        setSelectedUser(null);
        onSuccess?.();
      }
    } catch (err) {
      console.error('Recharge failed:', err);
      swal(t('error'), t('recharge_failed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOtherAmount = async () => {
    const amountStr = await swal({
      title: t('enter_amount'),
      content: {
        element: 'input',
        attributes: {
          type: 'number',
          min: '0.01',
          step: '0.01',
          placeholder: '0.00'
        }
      },
      buttons: [t('cancel'), t('ok')]
    });

    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
      handleRecharge(amount);
    }
  };

  return (
    <MDBModal open={show} onClose={() => setShow(false)} tabIndex='-1'>
      <MDBModalDialog size="lg">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{t('recharge_balance')}</MDBModalTitle>
            <MDBBtn className='btn-close' color='none' onClick={() => setShow(false)} disabled={isSaving} />
          </MDBModalHeader>
          <MDBModalBody>
            <MDBRow className='mb-3'>
              <MDBCol size='12'>
                <label>{t('user')}</label>
                <AsyncSearchableSelect
                  id="userSelect"
                  loadOptions={loadUserOptions}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder={t('search_user_by_name')}
                  disabled={isSaving}
                />
              </MDBCol>
            </MDBRow>
            <MDBRow className='g-2'>
              {[10, 20, 50, 100, 150, 200, 250].map((amount) => (
                <MDBCol size='3' key={amount}>
                  <MDBBtn block onClick={() => handleRecharge(amount)} disabled={isSaving}>
                    ${amount}
                  </MDBBtn>
                </MDBCol>
              ))}
              <MDBCol size='3'>
                <MDBBtn block color='secondary' onClick={handleOtherAmount} disabled={isSaving}>
                  {t('other_amount')}
                </MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color='secondary' onClick={() => setShow(false)} disabled={isSaving}>
              {isSaving ? <MDBSpinner size='sm' /> : t('close')}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}
