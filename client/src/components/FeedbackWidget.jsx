import React, { useState } from 'react';
import api from '../services/api';
import './FeedbackWidget.css'; // Optional: Can add inline or generic css

const FeedbackWidget = ({ context }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    scoreAccurate: '',
    feedbackUseful: '',
    wouldUseAgain: '',
    wouldPay: '',
    additionalComments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);

  const submitFeedback = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/api/feedback', { context, ...formData });
      setSubmitted(true);
    } catch (err) {
      console.error('Feedback submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-widget success">
        <h3 className="text-h4" style={{ color: '#10B981', textAlign: 'center' }}>Thanks for your feedback!</h3>
      </div>
    );
  }

  return (
    <div className="feedback-widget premium-bento-card style-glass">
      <h3 className="text-h3 mb-16">Help Us Improve</h3>
      
      {step === 1 && (
        <div className="feedback-step animate-fade-in">
          <div className="text-body mb-8">Was the score accurate?</div>
          <div className="feedback-options mb-16">
            {['Yes', 'No', 'N/A'].map(opt => (
              <button 
                key={opt}
                className={`feedback-btn ${formData.scoreAccurate === opt ? 'active' : ''}`}
                onClick={() => handleSelect('scoreAccurate', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={nextStep} disabled={!formData.scoreAccurate}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="feedback-step animate-fade-in">
          <div className="text-body mb-8">Was the feedback useful?</div>
          <div className="feedback-options mb-16">
            {['Yes', 'No'].map(opt => (
              <button 
                key={opt}
                className={`feedback-btn ${formData.feedbackUseful === opt ? 'active' : ''}`}
                onClick={() => handleSelect('feedbackUseful', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={nextStep} disabled={!formData.feedbackUseful}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="feedback-step animate-fade-in">
          <div className="text-body mb-8">Would you use this feature again?</div>
          <div className="feedback-options mb-16">
            {['Yes', 'No'].map(opt => (
              <button 
                key={opt}
                className={`feedback-btn ${formData.wouldUseAgain === opt ? 'active' : ''}`}
                onClick={() => handleSelect('wouldUseAgain', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={nextStep} disabled={!formData.wouldUseAgain}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div className="feedback-step animate-fade-in">
          <div className="text-body mb-8">Would you pay for this?</div>
          <div className="feedback-options mb-16">
            {['Yes', 'No'].map(opt => (
              <button 
                key={opt}
                className={`feedback-btn ${formData.wouldPay === opt ? 'active' : ''}`}
                onClick={() => handleSelect('wouldPay', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={submitFeedback} disabled={!formData.wouldPay || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
