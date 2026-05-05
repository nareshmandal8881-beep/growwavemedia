import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, getDoc, collection, query, where, getDocs,
  addDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Helmet } from 'react-helmet-async';
import SignatureCanvas from './components/SignatureCanvas';
import { Upload, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = ['Content Links', 'Bank Details', 'Digital Signature'];

export default function DealSubmitPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [deal, setDeal] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingSubId, setExistingSubId] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [sigData, setSigData] = useState(null);

  const [form, setForm] = useState({
    videoLink: '',
    timestamp: '',
    paymentDetails: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/portal/login'); return; }
      setLoading(true);
      try {
        // Get creator profile
        const cq = query(collection(db, 'portal_creators'), where('uid', '==', user.uid));
        const csnap = await getDocs(cq);
        if (csnap.empty) { navigate('/portal/login'); return; }
        const creatorData = { id: csnap.docs[0].id, ...csnap.docs[0].data() };
        setCreator(creatorData);

        // Get deal
        const dealDoc = await getDoc(doc(db, 'portal_deals', id));
        if (!dealDoc.exists()) {
          navigate('/portal/dashboard');
          return;
        }
        const dealData = { id: dealDoc.id, ...dealDoc.data() };
        // If creatorId is set, verify ownership. Old deals may not have it.
        if (dealData.creatorId && dealData.creatorId !== creatorData.id) {
          navigate('/portal/dashboard');
          return;
        }
        setDeal(dealData);
        setForm((f) => ({ ...f, paymentDetails: creatorData.paymentDetails || '' }));

        // Check existing submission
        const sq = query(collection(db, 'portal_submissions'), where('dealId', '==', id));
        const ssnap = await getDocs(sq);
        if (!ssnap.empty) {
          const sub = { id: ssnap.docs[0].id, ...ssnap.docs[0].data() };
          setExistingSubId(sub.id);
          setForm((f) => ({
            ...f,
            videoLink: sub.videoLink || '',
            timestamp: sub.timestamp || '',
            paymentDetails: sub.paymentDetails || f.paymentDetails,
          }));
          if (sub.signatureData) setSigData(sub.signatureData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.videoLink.trim()) e.videoLink = 'Unlisted Video link is required';
      if (!form.timestamp.trim()) e.timestamp = 'Timestamp is required';
    }
    if (step === 1) {
      if (!form.paymentDetails.trim()) e.paymentDetails = 'Payment details are required';
    }
    if (step === 2) {
      if (!sigData) e.signature = 'Signature is mandatory';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const subData = {
        dealId: id,
        dealTitle: deal.title,
        creatorId: creator.id,
        creatorName: creator.name,
        videoLink: form.videoLink,
        timestamp: form.timestamp,
        paymentDetails: form.paymentDetails,
        signatureData: sigData,
        amount: deal.amount || '',
        videoType: deal.videoType || '',
        status: 'submitted_video',
        submittedAt: serverTimestamp(),
      };

      if (existingSubId) {
        await updateDoc(doc(db, 'portal_submissions', existingSubId), subData);
      } else {
        await addDoc(collection(db, 'portal_submissions'), subData);
      }

      // Update deal status
      await updateDoc(doc(db, 'portal_deals', id), {
        status: 'submitted_video',
        updatedAt: serverTimestamp(),
      });

      // Also update creator's profile with the latest payment details
      await updateDoc(doc(db, 'portal_creators', creator.id), {
        paymentDetails: form.paymentDetails,
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-spinner" />
        <p>Loading deal…</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="portal-success-screen">
        <div className="portal-success-icon"><CheckCircle2 size={64} color="#34d399" /></div>
        <h2>Submission Received!</h2>
        <p>Your proof has been submitted. The admin will review and verify your payment.</p>
        <Link to="/portal/dashboard" className="portal-btn portal-btn--primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Submit Deal | Creator Portal</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="portal-submit-layout" style={{ background: 'var(--portal-bg)', minHeight: '100vh' }}>
        <div className="portal-submit-header">
          <Link to="/portal/dashboard" className="portal-back-link">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div>
            <h1 className="portal-submit-title">{deal?.title}</h1>
            <p className="portal-submit-meta">
              ₹{Number(deal?.amount || 0).toLocaleString('en-IN')} &middot; {deal?.platform}
            </p>
          </div>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        <div className="portal-submit-card">
          {/* Step 0 — Content Proof */}
          {step === 0 && (
            <div className="portal-step-body">
              <h2>Content Submission</h2>
              <p className="portal-step-desc">Provide the unlisted link to your promotional content.</p>

              <div className="portal-field">
                <label htmlFor="videoLink">Unlisted Video Link *</label>
                <input
                  id="videoLink" name="videoLink" type="url"
                  placeholder="https://youtube.com/watch?v=…"
                  value={form.videoLink} onChange={handleChange}
                />
                {errors.videoLink && <span className="portal-field-error">{errors.videoLink}</span>}
              </div>

              <div className="portal-field">
                <label htmlFor="timestamp">Promotion Time Stamp *</label>
                <input
                  id="timestamp" name="timestamp" type="text"
                  placeholder="e.g. 2:35 — 3:10"
                  value={form.timestamp} onChange={handleChange}
                />
                {errors.timestamp && <span className="portal-field-error">{errors.timestamp}</span>}
              </div>
            </div>
          )}

          {/* Step 1 — Bank Details */}
          {step === 1 && (
            <div className="portal-step-body">
              <h2>Payment Details</h2>
              <p className="portal-step-desc">Provide your bank or UPI details. This will be automatically added to your invoice.</p>

              <div className="portal-field" style={{ gridColumn: '1 / -1' }}>
                <label>Bank Name, A/C No, Holder Name, IFSC, or UPI ID *</label>
                <textarea 
                  name="paymentDetails"
                  rows="4" 
                  value={form.paymentDetails} 
                  onChange={handleChange}
                  placeholder="e.g. Bank Name: HDFC&#10;Account No: 123456789&#10;IFSC: HDFC0001234&#10;Holder Name: John Doe&#10;OR UPI ID: johndoe@upi"
                />
                {errors.paymentDetails && <span className="portal-field-error">{errors.paymentDetails}</span>}
              </div>
            </div>
          )}

          {/* Step 2 — Digital Signature */}
          {step === 2 && (
            <div className="portal-step-body">
              <h2>Digital Signature</h2>
              <p className="portal-step-desc">Please draw your signature below. This signature will be automatically attached to your invoice once payment is received.</p>
              
              <div style={{ marginTop: '1rem', border: errors.signature ? '2px solid red' : 'none' }}>
                <SignatureCanvas onSignature={setSigData} />
              </div>
              {errors.signature && <span className="portal-field-error" style={{display:'block',marginTop:'0.5rem'}}>{errors.signature}</span>}
              
              {existingSubId && (
                <div className="portal-alert portal-alert--info" style={{ marginTop: '2rem' }}>
                  You have a previous submission. This will overwrite it.
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="portal-step-nav">
            {step > 0 && (
              <button className="portal-btn portal-btn--ghost" onClick={back}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="portal-btn portal-btn--primary" onClick={next}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="portal-btn portal-btn--primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <span className="portal-btn-spinner" /> : '🚀 Submit Deal'}
              </button>
            )}
          </div>
        </div>

        {/* Comment Thread */}
        {existingSubId && (
          <div className="portal-submit-comments">
            <CommentThread submissionId={existingSubId} isAdmin={false} />
          </div>
        )}
      </div>
    </>
  );
}
