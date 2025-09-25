import React, { useState } from "react";
import "./PeoplePollPage.css";

const pollData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=250&q=80",
    question: "Is the road in your area broken?",
    date: "15th August 2024",
    location: "Alkapuri, Kolkata",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=250&q=80",
    question: "Is the public garbage bin overflowing?",
    date: "15th August 2024",
    location: "Barasat, West Bengal",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=250&q=80",
    question: "Are the street lights not working at night?",
    date: "15th August 2024",
    location: "VIP Road, Kolkata",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=250&q=80",
    question: "Is there water logging after rain?",
    date: "15th August 2024",
    location: "Park Circus, Kolkata",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=250&q=80",
    question: "Are public parks not maintained?",
    date: "15th August 2024",
    location: "Howrah Bridge, Kolkata",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=250&q=80",
    question: "Are open manholes in your street?",
    date: "15th August 2024",
    location: "Salt Lake, Kolkata",
  },
];

const voteOptions = [
  "Yes, this is true",
  "No, this is a scam",
  "I have not seen"
];

const PeoplePollPage: React.FC = () => {
  const [modalPollId, setModalPollId] = useState<number | null>(null);
  const [tempVote, setTempVote] = useState<string | null>(null);
  const [submittedVote, setSubmittedVote] = useState<{[key:number]: string}>({});

  // Modal handlers
  const openModal = (id: number) => {
    setModalPollId(id);
    setTempVote(null);
  };
  const closeModal = () => {
    setModalPollId(null);
    setTempVote(null);
  };
  const submitVote = () => {
    if (modalPollId && tempVote) {
      setSubmittedVote({...submittedVote, [modalPollId]: tempVote});
      closeModal();
    }
  };

  return (
    <div className="civic-poll-bg">
      <div className="civic-poll-container">
        <div className="civic-poll-header">
          <button className="civic-back-btn" onClick={()=>window.history.back()}>←</button>
          <div>
            <div className="civic-poll-title">People Poll</div>
            <div className="civic-poll-location">Kolkata, West Bengal</div>
          </div>
          <div className="civic-poll-reward">Reward Earned</div>
        </div>
        <div className="civic-poll-grid">
          {pollData.map((poll) => (
            <div className="civic-poll-card" key={poll.id}>
              <div className="civic-card-img-wrap">
                <img src={poll.image} alt="Civic Issue" className="civic-card-img" />
              </div>
              <div className="civic-card-question">{poll.question}</div>
              <div className="civic-card-meta">
                {poll.location}
                <span className="civic-card-date">{poll.date}</span>
              </div>
              {submittedVote[poll.id] ? (
                <div className="civic-card-voted">Thank you! Your vote: <span>{submittedVote[poll.id]}</span></div>
              ) : (
                <button className="civic-vote-btn" onClick={() => openModal(poll.id)}>
                  Vote Now
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {modalPollId && (
        <div className="civic-modal-bg" onClick={closeModal}>
          <div className="civic-modal-card" onClick={e=>e.stopPropagation()}>
            <div className="civic-modal-title">What is your response?</div>
            <div className="civic-modal-options">
              {voteOptions.map(opt => (
                <button
                  className={`civic-modal-option${tempVote===opt?' selected':''}`}
                  key={opt}
                  onClick={()=>setTempVote(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              className="civic-modal-submit"
              onClick={submitVote}
              disabled={!tempVote}
            >Submit Vote</button>
            <button className="civic-modal-close" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeoplePollPage;
