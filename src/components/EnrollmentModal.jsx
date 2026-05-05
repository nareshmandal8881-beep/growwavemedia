import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function EnrollmentModal({ isOpen, onClose }) {
  const [step, setStep] = useState('selection'); // 'selection' | 'form'
  const [userType, setUserType] = useState(null); // 'influencer' | 'brand'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // YouTube Section
    ytName: '',
    ytLink: '',
    ytSubs: '',
    // Instagram Section
    igHandle: '',
    igLink: '',
    igFollowers: '',
    // Facebook Section
    fbName: '',
    fbLink: '',
    fbFollowers: '',
    // Common / Brand
    niche: '',
    company: '',
    website: '',
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
          name: '', email: '', phone: '',
          ytName: '', ytLink: '', ytSubs: '',
          igHandle: '', igLink: '', igFollowers: '',
          fbName: '', fbLink: '', fbFollowers: '',
          niche: '', company: '', website: '', message: ''
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
      // 1. SAVE TO FIREBASE
      await addDoc(collection(db, 'leads'), {
        Date: new Date().toLocaleString(),
        Timestamp: serverTimestamp(),
        Type: userType,
        Name: formData.name,
        Email: formData.email,
        Phone: formData.phone,
        Handle_Company: formData.igHandle || formData.company || 'N/A',
        Niche_Website: formData.niche || formData.website || 'N/A',
        Followers: formData.igFollowers || 'N/A',
        Message: formData.message,
        // YT
        YT_Name: formData.ytName || 'N/A',
        YT_Link: formData.ytLink || 'N/A',
        YT_Subs: formData.ytSubs || 'N/A',
        // IG
        IG_Handle: formData.igHandle || 'N/A',
        IG_Link: formData.igLink || 'N/A',
        IG_Followers: formData.igFollowers || 'N/A',
        // FB
        FB_Name: formData.fbName || 'N/A',
        FB_Link: formData.fbLink || 'N/A',
        FB_Followers: formData.fbFollowers || 'N/A',
        // Specifics for Brand if needed (redundant but matches schema)
        Company: formData.company || 'N/A',
        Website: formData.website || 'N/A'
      });

      // 2. PREPARE WHATSAPP MESSAGE
      let waText = 
        `*New Enrollment — Grow Wave Media*%0A%0A` +
        `*Category:* ${userType.toUpperCase()}%0A` +
        `*Name:* ${formData.name}%0A` +
        `*Email:* ${formData.email}%0A` +
        `*Phone:* ${formData.phone}%0A`;

      if (userType === 'influencer') {
        waText += 
          `%0A*--- YouTube ---*%0A` +
          `*YT Name:* ${formData.ytName || 'N/A'}%0A` +
          `*YT Subs:* ${formData.ytSubs || 'N/A'}%0A` +
          `%0A*--- Instagram ---*%0A` +
          `*IG Handle:* ${formData.igHandle || 'N/A'}%0A` +
          `*IG Followers:* ${formData.igFollowers || 'N/A'}%0A` +
          `%0A*--- Facebook ---*%0A` +
          `*FB Name:* ${formData.fbName || 'N/A'}%0A` +
          `*FB Followers:* ${formData.fbFollowers || 'N/A'}%0A`;
      } else {
        waText += 
          `*Company:* ${formData.company}%0A` +
          `*Website:* ${formData.website}%0A`;
      }

      waText += `%0A*Message:* ${formData.message}`;

      window.open(`https://wa.me/917063363898?text=${waText}`, '_blank');

      setIsSuccess(true);
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Firestore Error: ' + error.message + '. Please check if Firestore Rules allow writes.');
      setIsSuccess(false);
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

                <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
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
                    {userType === 'influencer' ? 'Influencer Enrollment' : 'Brand Enrollment'}
                  </h2>
                  <p>Please fill in the details below to apply.</p>
                </div>

                <form className="enrollment-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    {/* Basic Info */}
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

                    {userType === 'influencer' ? (
                      <>
                        <div className="form-group">
                          <label>Niche / Category</label>
                          <input 
                            type="text" name="niche" required 
                            placeholder="e.g. Tech, Fashion, Lifestyle"
                            value={formData.niche} onChange={handleInputChange} 
                          />
                        </div>

                        {/* YouTube Section */}
                        <div className="form-section-title">📺 YouTube Section</div>
                        <div className="form-group">
                          <label>Channel Name</label>
                          <input 
                            type="text" name="ytName" 
                            placeholder="e.g. John's Tech Corner"
                            value={formData.ytName} onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Channel Link</label>
                          <input 
                            type="url" name="ytLink" 
                            placeholder="e.g. youtube.com/@john"
                            value={formData.ytLink} onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Subscriber Count</label>
                          <input 
                            type="text" name="ytSubs" 
                            placeholder="e.g. 100K"
                            value={formData.ytSubs} onChange={handleInputChange} 
                          />
                        </div>

                        {/* Instagram Section */}
                        <div className="form-section-title">📸 Instagram Section</div>
                        <div className="form-group">
                          <label>Instagram Handle</label>
                          <input 
                            type="text" name="igHandle" 
                            placeholder="e.g. @john_tech"
                            value={formData.igHandle} onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Profile Link</label>
                          <input 
                            type="url" name="igLink" 
                            placeholder="e.g. instagram.com/john_tech"
                            value={formData.igLink} onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Followers Count</label>
                          <input 
                            type="text" name="igFollowers" 
                            placeholder="e.g. 50K"
                            value={formData.igFollowers} onChange={handleInputChange} 
                          />
                        </div>

                        {/* Facebook Section */}
                        <div className="form-section-title">📘 Facebook Section</div>
                        <div className="form-group">
                          <label>Page/Profile Name</label>
                          <input 
                            type="text" name="fbName" 
                            placeholder="e.g. John Doe Official"
                            value={formData.fbName} onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Page Link</label>
                          <input 
                            type="url" name="fbLink" 
                            placeholder="e.g. facebook.com/johndoe"
                            value={formData.fbLink} onChange={handleInputChange} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Followers Count</label>
                          <input 
                            type="text" name="fbFollowers" 
                            placeholder="e.g. 20K"
                            value={formData.fbFollowers} onChange={handleInputChange} 
                          />
                        </div>
                      </>
                    ) : (
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
                    )}

                    <div className="form-group full-width">
                      <label>Additional Information</label>
                      <textarea 
                        name="message" rows="3" required
                        placeholder="Tell us more about your work or goals..."
                        value={formData.message} onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className="btn-solid full-width" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
