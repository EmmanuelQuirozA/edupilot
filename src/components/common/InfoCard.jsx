import { MDBCard, MDBCardBody, MDBIcon } from 'mdb-react-ui-kit';

export default function InfoCard({ title, counts, icon, borderColor, iconColor }) {
  return (
    <MDBCard className='shadow-sm' 
      // style={{ borderTop: `4px solid ${borderColor}`, borderRadius: '8px' }}
    >
      <MDBCardBody className="d-flex align-items-center">
        <MDBIcon fas icon={icon} size="3x" className=" me-4" style={{ color: iconColor}} />
        <div>
          <h6 className="text-muted text-uppercase small">{title}</h6>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="d-flex gap-4">
              {counts.map((item, idx) => (
                <div key={idx}>
                  <h4 className="mb-0 fw-bold">{item.value}</h4>
                  <small className="text-muted">{item.label}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
}
