import React, { useState, useEffect } from 'react';
import { useDropzone }               from 'react-dropzone';
import { MDBRow, MDBIcon, MDBBtn }    from 'mdb-react-ui-kit';
import { useTranslation }             from 'react-i18next';
import { MDBCard, MDBCardHeader, MDBCardBody } from 'mdb-react-ui-kit';
import ProtectedFileModal             from '../modals/ProtectedFileModal';
import swal                           from 'sweetalert';
import { uploadPaymentReceipt,removePaymentReceipt }              from '../../api/studentApi';

export default function RequestSettings({ data, onSuccess, canEdit }) {
  const { t, i18n } = useTranslation()

  const { receipt_path: receiptPath, receipt_file_name: receiptName, payment_id } = data;


  const [showFileModal, setShowFileModal] = useState(false);
  const [modalFilename, setModalFilename] = useState('');
  const [modalFilepath, setModalFilepath] = useState('');

  const [file, setFile]       = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSaving, setIsSaving]   = useState(false);

  // Dropzone config: accept pdf and images <=10MB
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { 'application/pdf': [], 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: accepted => {
      setFileError('');
      setFile(accepted[0] || null);
    }
  });
  
  // Handle file rejections
  useEffect(() => {
    if (fileRejections.length) {
      setFileError(fileRejections[0].errors[0].message);
    }
  }, [fileRejections]);
  
  // 1) Upload or replace receipt
  const handleUpload = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
      const res = await uploadPaymentReceipt(payment_id, file, i18n.language);
      swal(res.title, res.message, res.type);
      if (res.success !== false) {
        onSuccess();
      }
    } catch (err) {
      swal(t('error'), t('unexpected_error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 2) Delete existing receipt
  const handleRemove = async () => {
    if (!receiptPath) return;
    setIsSaving(true);
    swal({
      title:    t('confirm_remove_receipt'),  
      text:     t('are_you_sure_remove_receipt'), 
      icon:     'warning',
      buttons:  [t('no'), t('yes')],
      dangerMode:true,
    }).then(async willDo => {
      if (willDo) {
        try {
          const res = await removePaymentReceipt(
            payment_id,
            i18n.language
          );
          swal(res.title, res.message, res.type);
          if (res.success !== false) {
            onSuccess();
          }
        } catch (err) {
          swal(t('error'), t('unexpected_error'), 'error');
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  return (
    <>
      <MDBCard className="shadow-sm border-0 mb-3">
        <MDBCardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <MDBIcon fas icon="file-invoice" className="me-2" />
            <h4 className="mb-0">{t('payment_receipt')}</h4>
          </div>
          {canEdit && receiptPath && receiptName && (
            <MDBBtn color="danger" size="sm" onClick={handleRemove} disabled={isSaving}>
              <MDBIcon fas icon="trash-can" />
            </MDBBtn>
          )}
        </MDBCardHeader>

        <MDBCardBody>
          {receiptPath ? (
            <button
              className="btn btn-link p-4 text-center w-100"
              onClick={() => {
                setModalFilename(receiptName);
                setModalFilepath(receiptPath);
                setShowFileModal(true);
              }}
              disabled={isSaving}
            >
              <MDBIcon fas icon="file-invoice" size="3x" className="mb-2" />
              <div>{receiptName}</div>
            </button>
          ) : (
            <div
              {...getRootProps()}
              className={`p-4 text-primary text-center ${
              isDragActive ? 'bg-light' : ''
              }`}
                style={{ cursor: 'pointer' }}
              >
                <input {...getInputProps()} />
              <MDBIcon fas icon="cloud-upload-alt" size="3x" className="mb-2" />
              <p>{file?.name || t('drag_drop_or_click_to_upload')}</p>
              {fileError && <small className="text-danger">{fileError}</small>}
            </div>
          )}

          {/* show upload button only when a new file is staged */}
          {!receiptPath && file && (
            <MDBBtn className="mt-3" onClick={handleUpload} disabled={isSaving || fileError}>
              {isSaving ? t('saving') : t('upload')}
            </MDBBtn>
          )}
        </MDBCardBody>
      </MDBCard>
      
                
      <ProtectedFileModal
        filename={modalFilename}
        filepath={modalFilepath}
        show={showFileModal}
        onClose={() => setShowFileModal(false)}
        lang={i18n.language}
      />
    </>
  );
}