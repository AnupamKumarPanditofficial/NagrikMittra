import React, { useState } from 'react';
import './FeedbackPage.css';

type FeedbackPost = {
  id: number;
  user: string;
  date: string;
  image: string;
  message: string;
};

const dummyPreviousComplaints = [
  { id: 1, title: 'Garbage Dumping', description: 'Overflowing trash at Ward 5' },
  { id: 2, title: 'Street Light', description: 'Light not working in Sector 3' },
];

const dummyFeedbackPosts: FeedbackPost[] = [
  {
    id: 10,
    user: 'Rahul Singh',
    date: '2025-09-12',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    message: 'Road crack fixed perfectly. Thanks to the prompt response!',
  },
  {
    id: 11,
    user: 'Priya Shah',
    date: '2025-09-13',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    message: 'Water pipeline was replaced, waterlogging resolved!',
  },
];

const FeedbackPage: React.FC = () => {
  const [activeCard, setActiveCard] = useState<'feedback' | 'see' | 'report' | null>(null);

  /** Feedback states **/
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  /** Report states **/
  const [newComplaint, setNewComplaint] = useState({ name: '', address: '', problem: '' });
  const [submittedComplaint, setSubmittedComplaint] = useState(false);

  const handleFeedbackSubmit = () => {
    if (!selectedComplaintId || !feedbackText.trim()) {
      alert('Please select a complaint and enter your feedback.');
      return;
    }
    setSubmittedFeedback(true);
    setFeedbackText('');
  };

  const handleComplaintChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewComplaint({ ...newComplaint, [e.target.name]: e.target.value });
  };

  const handleComplaintSubmit = () => {
    if (!newComplaint.name.trim() || !newComplaint.address.trim() || !newComplaint.problem.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    setSubmittedComplaint(true);
    setNewComplaint({ name: '', address: '', problem: '' });
  };

  return (
    <div className="feedback-page-container">
      <h1>Feedback & Complaint Center</h1>

      <div className="card-selector">
        <div
          className={`card-btn ${activeCard === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveCard('feedback')}
        >
          <span>Give Feedback</span>
        </div>
        <div
          className={`card-btn ${activeCard === 'see' ? 'active' : ''}`}
          onClick={() => setActiveCard('see')}
        >
          <span>See Others Feedback</span>
        </div>
        <div
          className={`card-btn ${activeCard === 'report' ? 'active' : ''}`}
          onClick={() => setActiveCard('report')}
        >
          <span>Report to Main Office</span>
        </div>
      </div>

      {/* Main sections below cards */}
      <div className="card-content">
        {activeCard === 'feedback' && (
          <section>
            <h2>Give Feedback on Previous Complaint</h2>
            <select
              value={selectedComplaintId ?? ''}
              onChange={e => setSelectedComplaintId(Number(e.target.value))}
            >
              <option value="" disabled>Select a complaint</option>
              {dummyPreviousComplaints.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} - {c.description}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Enter your feedback"
              rows={4}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
            />
            <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
            {submittedFeedback && <p className="success-msg">Feedback submitted!</p>}
          </section>
        )}

        {activeCard === 'see' && (
          <section>
            <h2>Community Feedback & Solutions</h2>
            <div className="scroll-cards-container">
              {dummyFeedbackPosts.map(post => (
                <div className="feedback-card" key={post.id}>
                  <img src={post.image} alt={post.user} className="user-img" />
                  <div className="feedback-details">
                    <div className="user-info">
                      <div className="user-name">{post.user}</div>
                      <div className="feedback-date">{post.date}</div>
                    </div>
                    <div className="feedback-message">{post.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeCard === 'report' && (
          <section>
            <h2>Report a New Problem to Main Office</h2>
            <input
              type="text"
              placeholder="Your Name"
              name="name"
              value={newComplaint.name}
              onChange={handleComplaintChange}
            />
            <input
              type="text"
              placeholder="Your Address"
              name="address"
              value={newComplaint.address}
              onChange={handleComplaintChange}
            />
            <textarea
              placeholder="Describe your problem"
              name="problem"
              rows={5}
              value={newComplaint.problem}
              onChange={handleComplaintChange}
            />
            <button onClick={handleComplaintSubmit}>Submit Complaint</button>
            {submittedComplaint && <p className="success-msg">Complaint submitted!</p>}
          </section>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
