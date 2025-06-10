import React from 'react';
import { MDBRow, MDBIcon, MDBBtn, MDBDropdown } from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import { MDBCard, MDBCardHeader, MDBCardBody, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBCol } from 'mdb-react-ui-kit';

export default function RequestSettings({ 
  data,
  onEditRequestSettings,
  canUpdateRequest
}) {
  const { t } = useTranslation();
  const { paymentRequest } = data;

  // Style for each group
	const groupStyle = {
		borderBottom: '1px solid rgb(228 228 228)',
		marginBottom: '1.5rem'
	};

  return (
    <>
      <MDBCard className="shadow-sm border-0 mb-3">
        <MDBCardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <MDBIcon fas icon="wrench" className="me-2" />
            <h4 className="mb-0">{t("settings")}</h4> 
          </div>
          {/* ── Desktop: show button inline ── */}
          <div className="d-none d-md-block">
            {canUpdateRequest &&  paymentRequest.payment_status_id !== 7 && paymentRequest.payment_status_id !== 8 && (
              <MDBBtn flat size="sm" onClick={() => onEditRequestSettings(data)}>
                <MDBIcon fas icon="pen" />
              </MDBBtn>)
            }
          </div>

          {/* ── Mobile: show a dropdown instead ── */}
          <div className="d-block d-md-none">
            <MDBDropdown>
              <MDBDropdownToggle tag="button" className="btn btn-light btn-sm"></MDBDropdownToggle>
              <MDBDropdownMenu>
                <MDBDropdownItem className='p-1' onClick={() => onEditRequestSettings(data)}>
                  {t('edit')}
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </div>
        </MDBCardHeader>
        <MDBCardBody>
          <div style={groupStyle}>
            <MDBRow>
              {/* Late Fee */}
              <MDBCol md="12" className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <MDBIcon fas icon="clock" className="me-2 text-secondary" />
                    <span className="mb-0">{t("late_fee")}:</span>
                  </div>
                  <strong>{paymentRequest.late_fee ?? "N/A"}</strong>
                </div>
              </MDBCol>
              {/* Fee Type */}
              <MDBCol md="12" className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <MDBIcon fas icon="tag" className="me-2 text-secondary" />
                    <span className="mb-0">{t("fee_type")}:</span>
                  </div>
                  <strong>{paymentRequest.fee_type ?? "N/A"}</strong>
                </div>
              </MDBCol>
              {/* Late Fee Frequency */}
              <MDBCol md="12" className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <MDBIcon fas icon="sync-alt" className="me-2 text-secondary" />
                    <span className="mb-0">{t("late_fee_frequency")}:</span>
                  </div>
                  <strong>{paymentRequest.late_fee_frequency ?? "N/A"}</strong>
                </div>
              </MDBCol>
              {/* Partial Payment */}
              <MDBCol md="12" className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <MDBIcon fas icon="code-branch" className="me-2 text-secondary" />
                    <span className="mb-0">{t("partial_payment")}:</span>
                  </div>
                  <strong
                    className={`px-2 py-1 rounded ${
                      paymentRequest.partial_payment
                        ? "bg-success text-white"
                        : "bg-danger text-white"
                    }`}
                    style={{ display: "inline-block" }}
                  >
                    {paymentRequest.partial_payment_transformed ?? "N/A"}
                  </strong>
                </div>
              </MDBCol>
              {/* Mass Upload */}
              <MDBCol md="12" className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <MDBIcon fas icon="file-upload" className="me-2 text-secondary" />
                    <span className="mb-0">{t("mass_upload")}:</span>
                  </div>
                  <strong>{paymentRequest.mass_upload ?? "N/A"}</strong>
                </div>
              </MDBCol>
            </MDBRow>
          </div>
        </MDBCardBody>
      </MDBCard>
    </>
  );
}