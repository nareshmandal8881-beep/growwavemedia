import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Send, CheckCircle2, TrendingUp } from 'lucide-react';

export default function EnrollmentModal({ isOpen, onClose }) {
  const [step, setStep] = useState('selection'); // 'selection' | 'form'
  const [userType, setUserType] = useState(null); // 'creator' | 'influencer' | 'brand'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    handle: '',
    niche: '',
    followers: '',
    company: '',
    website: '',
    goals: '',
    message: ''
  });

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('selection');
        setUserType(null);
        setIsSuccess(false);
        setIsSubmitting(false);
        setFormData({
          name: '', email: '', phone: '', handle: '',
          niche: '', followers: '', company: '', website: '', goals: '', message: ''
        });
      }, 300);
    }
  }, [isOpen]);

  const handleTypeSelect = (type) => {
    setUserType(type);
    setStep('form');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. SAVE TO GOOGLE SHEET (Using SheetDB as a bridge)
      const sheetResponse = await fetch('https://sheetdb.io/api/v1/myhiyvk7r2sy9', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              Date: new Date().toLocaleString(),
              Type: userType,
              Name: formData.name,
              Email: formData.email,
              Phone: formData.phone,
              Handle_Company: formData.handle || formData.company,
              Niche_Website: formData.niche || formData.website,
              Followers: formData.followers || 'N/A',
              Message: formData.message
            }
          ]
        })
      });

      // 2. PREPARE WHATSAPP MESSAGE
      const waText = 
        `*New Enrollment — Grow Wave Media*%0A%0A` +
        `*Category:* ${userType.toUpperCase()}%0A` +
        `*Name:* ${formData.name}%0A` +
        `*Email:* ${formData.email}%0A` +
        `*Phone:* ${formData.phone}%0A` +
        (userType === 'brand' 
          ? `*Company:* ${formData.company}%0A*Website:* ${formData.website}` 
          : `*Handle:* ${formData.handle}%0A*Niche:* ${formData.niche}${userType === 'influencer' ? `%0A*Followers:* ${formData.followers}` : ''}`) +
        `%0A%0A*Message:* ${formData.message}`;

      // 3. OPEN WHATSAPP IN NEW TAB
      window.open(`https://wa.me/917063363898?text=${waText}`, '_blank');

      if (sheetResponse.ok) {
        setIsSuccess(true);
      } else {
        // Even if sheet fails, WhatsApp was opened, but we should inform about the sheet
        console.warn('SheetDB save failed, but WhatsApp was triggered.');
        setIsSuccess(true); 
      }
    } catch (error) {
      console.error('Submission Error:', error);
      // Fallback: still try to open WhatsApp even if API fails
      const waTextFallback = `*New Enrollment (Manual):* ${formData.name} (${userType})`;
      window.open(`https://wa.me/917063363898?text=${waTextFallback}`, '_blank');
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="modal-success">
            <div className="success-icon">
              <CheckCircle2 size={64} color="var(--accent)" />
            </div>
            <h2>Application Received!</h2>
            <p>Thank you for enrolling. Our team will review your details and get back to you within 24-48 hours.</p>
            <button className="btn-solid" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {step === 'selection' ? (
              <div className="modal-selection">
                <div className="modal-header">
                  <span className="eyebrow">Join the Wave</span>
                  <h2>How would you like to enroll?</h2>
                  <p>Choose the option that best describes you to get started.</p>
                </div>

                <div className="selection-grid">
                  <button className="selection-card" onClick={() => handleTypeSelect('creator')}>
                    <div className="card-icon creator">
                      <User size={32} />
                    </div>
                    <h3>You are a Creator</h3>
                    <p>UGC creators and artists looking for high-end content collaborations.</p>
                  </button>

                  <button className="selection-card" onClick={() => handleTypeSelect('influencer')}>
                    <div className="card-icon influencer">
                      <TrendingUp size={32} />
                    </div>
                    <h3>You are an Influencer</h3>
                    <p>Established voices looking to amplify brand reach and scale.</p>
                  </button>

                  <button className="selection-card" onClick={() => handleTypeSelect('brand')}>
                    <div className="card-icon brand">
                      <Briefcase size={32} />
                    </div>
                    <h3>You are a Brand</h3>
                    <p>Businesses and startups looking for high-impact marketing and growth.</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-form-container">
                <div className="modal-header">
                  <button className="back-btn" onClick={() => setStep('selection')}>
                    &larr; Back
                  </button>
                  <h2>
                    {userType === 'creator' ? 'Creator Enrollment' : 
                     userType === 'influencer' ? 'Influencer Enrollment' : 
                     'Brand Enrollment'}
                  </h2>
                  <p>Please fill in the details below to apply.</p>
                </div>

                <form className="enrollment-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" name="name" required 
                        placeholder="e.g. John Doe"
                        value={formData.name} onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" name="email" required 
                        placeholder="e.g. john@example.com"
                        value={formData.email} onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" name="phone" required 
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone} onChange={handleInputChange} 
                      />
                    </div>

                    {userType === 'brand' ? (
                      <>
                        <div className="form-group">
                          <label>Company Name</label>
                          <input 
                            type="text" name="company" required 
                            placeholder="e.g. Acme Inc."
                            value={formData.company} onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Website URL</label>
                          <input 
                            type="url" name="website" required 
                            placeholder="e.g. https://acme.com"
                            value={formData.website} onChange={handleInputChange} 
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Primary Handle (IG/YT/etc.)</label>
                          <input 
                            type="text" name="handle" required 
                            placeholder="e.g. @johndoe_official"
                            value={formData.handle} onChange={handleInputChange} 
                          />
                        </div>
                        {userType === 'influencer' ? (
                          <div className="form-group">
                            <label>Followers Count</label>
                            <input 
                              type="text" name="followers" required 
                              placeholder="e.g. 50K+, 1M"
                              value={formData.followers} onChange={handleInputChange} 
                            />
                          </div>
                        ) : (
                          <div className="form-group">
                            <label>Niche / Category</label>
                            <input 
                              type="text" name="niche" required 
                              placeholder="e.g. Tech, Fashion, Lifestyle"
                              value={formData.niche} onChange={handleInputChange} 
                            />
                          </div>
                        )}
                      </>
                    )}

                    {userType === 'influencer' && (
                      <div className="form-group full-width">
                        <label>Niche / Category</label>
                        <input 
                          type="text" name="niche" required 
                          placeholder="e.g. Tech, Fashion, Lifestyle"
                          value={formData.niche} onChange={handleInputChange} 
                        />
                      </div>
                    )}

                    <div className="form-group full-width">
                      <label>
                        {userType === 'brand' ? 'Your Marketing Goals' : 
                         userType === 'creator' ? 'Tell us about your work' : 
                         'Tell us about your audience'}
                      </label>
                      <textarea 
                        name="message" rows="3" required
                        placeholder={
                          userType === 'brand' ? "What are you looking to achieve?" : 
                          userType === 'creator' ? "What kind of content do you create? (e.g. UGC, Reels)" : 
                          "What platforms are you most active on and who is your audience?"
                        }
                        value={formData.message} onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className="btn-solid full-width" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="loader-container">
                        Submitting...
                      </span>
                    ) : (
                      <>
                        Submit Application <Send size={18} style={{ marginLeft: '8px' }} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
