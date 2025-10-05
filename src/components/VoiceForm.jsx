import { useState, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import SubmissionCard from './SubmissionCard';
import { supabase } from '../utils/supabaseClient';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { saveToQueue, getQueue, removeFromQueue } from '../utils/offlineQueue';

const VoiceForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    address: '',
    message: ''
  });

  const [language, setLanguage] = useState('hi-IN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    loadPendingSubmissions();
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncPendingSubmissions();
    }
  }, [isOnline]);

  const loadPendingSubmissions = () => {
    const pending = getQueue();
    setPendingSubmissions(pending);
  };

  const syncPendingSubmissions = async () => {
    const pending = getQueue();

    for (const submission of pending) {
      try {
        const { tempId, ...submissionData } = submission;
        // Map role to email to match existing DB schema
        const payload = {
          name: submissionData.name,
          email: submissionData.role || submissionData.email || '',
          phone: submissionData.phone,
          address: submissionData.address,
          message: submissionData.message,
          created_at: submissionData.created_at
        };

        const { data, error } = await supabase
          .from('form_submissions')
          .insert([payload])
          .select();

        if (!error && data) {
          removeFromQueue(tempId);
          setSubmissions(prev => [data[0], ...prev]);
        }
      } catch (error) {
        console.error('Error syncing submission:', error);
      }
    }

    loadPendingSubmissions();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (isOnline) {
        // The backend table currently expects an `email` column.
        // Map the selected `role` into the `email` field so inserts succeed
        // without changing the existing database schema.
        const payload = {
          name: formData.name,
          email: formData.role,
          phone: formData.phone,
          address: formData.address,
          message: formData.message
        };

        const { data, error } = await supabase
          .from('form_submissions')
          .insert([payload])
          .select();

        if (error) throw error;

        setSubmitMessage('Form submitted successfully!');
        setSubmissions(prev => [data[0], ...prev]);
      } else {
        const savedSubmission = saveToQueue(formData);
        setPendingSubmissions(prev => [...prev, savedSubmission]);
        setSubmitMessage('Saved offline. Will upload when online.');
      }

      setFormData({
        name: '',
        role: '',
        phone: '',
        address: '',
        message: ''
      });

      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setSubmitMessage('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const languageOptions = [
    { value: 'hi-IN', label: 'Hindi (हिन्दी)' },
    { value: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { value: 'en-IN', label: 'English' }
  ];

  return (
    <div className="voice-form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1 className="form-title">Voice-Enabled Form</h1>
          <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        <p className="form-subtitle">
          Click the microphone icon to use voice input
        </p>

        <div className="form-field">
          <label className="form-label">
            Select Language / भाषा चुनें / ਭਾਸ਼ਾ ਚੁਣੋ
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">
              Name / नाम / ਨਾਮ *
            </label>
            <VoiceInput
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
              language={language}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Role (Head of Family / Patient) *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="language-select"
            >
              <option value="">Select role</option>
              <option value="Head of Family">Head of Family</option>
              <option value="Patient">Patient</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">
              Phone / फ़ोन / ਫ਼ੋਨ
            </label>
            <VoiceInput
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              language={language}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Address / पता / ਪਤਾ
            </label>
            <VoiceInput
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              placeholder="Enter your address"
              language={language}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Message / संदेश / ਸੁਨੇਹਾ
            </label>
            <VoiceInput
              value={formData.message}
              onChange={(value) => handleInputChange('message', value)}
              placeholder="Enter your message"
              language={language}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.role}
            className={`submit-button ${(isSubmitting || !formData.name || !formData.role) ? 'disabled' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>

          {submitMessage && (
            <div className={`submit-message ${submitMessage.includes('success') || submitMessage.includes('offline') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}
        </form>
      </div>

      <div className="submissions-panel">
        <h2 className="submissions-title">Submissions</h2>

        {pendingSubmissions.length > 0 && (
          <div>
            <h3 className="submissions-section-title">Pending Upload</h3>
            {pendingSubmissions.map((submission) => (
              <SubmissionCard
                key={submission.tempId}
                submission={submission}
                status="pending"
              />
            ))}
          </div>
        )}

        {submissions.length > 0 && (
          <div>
            {pendingSubmissions.length > 0 && (
              <h3 className="submissions-section-title">Uploaded</h3>
            )}
            {submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                status="uploaded"
              />
            ))}
          </div>
        )}

        {submissions.length === 0 && pendingSubmissions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p className="empty-text">
              No submissions yet. Fill out the form to get started!
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .voice-form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          display: flex;
          gap: 30px;
          align-items: flex-start;
          justify-content: center;
        }

        .form-wrapper {
          max-width: 600px;
          width: 100%;
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .form-title {
          color: #333;
          font-size: 32px;
          font-weight: 700;
          margin: 0;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .status-badge.online {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.offline {
          background: #f8d7da;
          color: #721c24;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-badge.online .status-dot {
          background: #4CAF50;
        }

        .status-badge.offline .status-dot {
          background: #f44336;
        }

        .form-subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 16px;
        }

        .form-field {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }

        .language-select {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
          background: white;
          transition: border-color 0.3s;
        }

        .language-select:focus {
          border-color: #667eea;
        }

        .submit-button {
          width: 100%;
          padding: 14px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .submit-button.disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
        }

        .submit-message {
          margin-top: 20px;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
        }

        .submit-message.success {
          background: #d4edda;
          color: #155724;
        }

        .submit-message.error {
          background: #f8d7da;
          color: #721c24;
        }

        .submissions-panel {
          max-width: 400px;
          width: 100%;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 10px;
        }

        .submissions-title {
          color: white;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: center;
        }

        .submissions-section-title {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          margin-top: 20px;
          opacity: 0.9;
        }

        .submissions-section-title:first-child {
          margin-top: 0;
        }

        .empty-state {
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          color: white;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-text {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .voice-form-container {
            flex-direction: column;
            align-items: center;
            padding: 20px 15px;
          }

          .form-wrapper {
            max-width: 100%;
          }

          .submissions-panel {
            max-width: 100%;
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .form-wrapper {
            padding: 30px 20px;
          }

          .form-title {
            font-size: 24px;
          }

          .form-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .status-badge {
            align-self: flex-start;
          }

          .form-subtitle {
            font-size: 14px;
            margin-bottom: 20px;
          }

          .submissions-title {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .voice-form-container {
            padding: 15px 10px;
          }

          .form-wrapper {
            padding: 20px 16px;
            border-radius: 12px;
          }

          .form-title {
            font-size: 20px;
          }

          .form-subtitle {
            font-size: 13px;
          }

          .form-label {
            font-size: 13px;
          }

          .language-select {
            padding: 10px;
            font-size: 14px;
          }

          .submit-button {
            padding: 12px;
            font-size: 16px;
          }

          .status-badge {
            font-size: 12px;
            padding: 5px 10px;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: translateY(-50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-50%) scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceForm;
