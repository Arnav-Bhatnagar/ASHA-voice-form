const SubmissionCard = ({ submission, status }) => {
  const isPending = status === 'pending';

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: isPending ? '2px solid #ff9800' : '2px solid #4CAF50',
      position: 'relative',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: isPending ? '#ff9800' : '#4CAF50',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {isPending ? (
          <>
            <span style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite'
            }}></span>
            Pending
          </>
        ) : (
          <>
            <span>✓</span>
            Uploaded
          </>
        )}
      </div>

      <div style={{ marginTop: '8px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            NAME
          </div>
          <div style={{
            fontSize: '16px',
            color: '#333',
            fontWeight: '500'
          }}>
            {submission.name}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            color: '#666',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            ROLE
          </div>
          <div style={{
            fontSize: '14px',
            color: '#333'
          }}>
            {submission.role || submission.email}
          </div>
        </div>

        {submission.phone && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              PHONE
            </div>
            <div style={{
              fontSize: '14px',
              color: '#333'
            }}>
              {submission.phone}
            </div>
          </div>
        )}

        {submission.address && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              ADDRESS
            </div>
            <div style={{
              fontSize: '14px',
              color: '#333'
            }}>
              {submission.address}
            </div>
          </div>
        )}

        {submission.message && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              MESSAGE
            </div>
            <div style={{
              fontSize: '14px',
              color: '#333'
            }}>
              {submission.message}
            </div>
          </div>
        )}

        <div style={{
          fontSize: '11px',
          color: '#999',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #eee'
        }}>
          {new Date(submission.created_at || Date.now()).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SubmissionCard;
