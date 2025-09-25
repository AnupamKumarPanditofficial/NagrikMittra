import React, { useState } from 'react';
import './CheckStatusPage.css';

type StatusStep = {
  label: string;
  date: string;
  completed: boolean;
};

const dummyJourney: StatusStep[] = [
  { label: 'Submitted', date: '2025-09-01', completed: true },
  { label: 'Forwarded to M Officer', date: '2025-09-03', completed: true },
  { label: 'People Poll Sent', date: '2025-09-05', completed: true },
  { label: 'Review', date: '2025-09-10', completed: true },
  { label: 'Sent to P Officer', date: '', completed: false },
  { label: 'Final Decision', date: '', completed: false },
];

const CheckStatusPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [statusJourney, setStatusJourney] = useState<StatusStep[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only digits and max 12 chars
    if (/^\d{0,12}$/.test(val)) {
      setCode(val);
      setError('');
    }
  };

  const handleCheckStatus = () => {
    if (code.length !== 12) {
      setError('Please enter a valid 12-digit code');
      setStatusJourney([]);
      return;
    }
    // Here you would fetch journey data from server
    // For demo, use dummyJourney
    setStatusJourney(dummyJourney);
  };

  return (
    <div className="check-status-container">
      <h1>Check Complaint Status</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter 12-digit code"
          value={code}
          onChange={handleInputChange}
          maxLength={12}
          aria-label="12 digit complaint code"
        />
        <button onClick={handleCheckStatus}>Check Status</button>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {statusJourney.length > 0 && (
        <div className="status-journey">
          {statusJourney.map(({ label, date, completed }, index) => (
            <div
              key={index}
              className={`status-step ${completed ? 'completed' : ''}`}
            >
              <div className="step-marker">{completed ? '✔' : '✘'}</div>
              <div className="step-info">
                <div className="step-label">{label}</div>
                <div className="step-date">{date || 'Pending'}</div>
              </div>
              {index !== statusJourney.length - 1 && (
                <div className="step-connector" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckStatusPage;
