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
import StepIndicator from './components/StepIndicator';
import CommentThread from './components/CommentThread';
import { Upload, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = ['Content Proof', 'Payment Proof', 'Review & Submit'];
const PLATFORMS = ['Instagram', 'YouTube', 'Facebook', 'Twitter/X', 'LinkedIn', 'Other'];

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

  const [form, setForm] = useState({
    videoLink: '',
    timestamp: '',
    platform: '',
    deliverableNotes: '',
    amount: '',
    utrId: '',
    proofFile: null,
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
        if (!dealDoc.exists() || dealDoc.data().creatorId !== creatorData.id) {
          navigate('/portal/dashboard');
          return;
        }
        const dealData = { id: dealDoc.id, ...dealDoc.data() };
        setDeal(dealData);
        setForm((f) => ({ ...f, amount: dealData.amount || '', platform: dealData.platform || '' }));

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
            platform: sub.platform || f.platform,
            deliverableNotes: sub.deliverableNotes || '',
            utrId: sub.utrId || '',
          }));
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
    const { name, value, files } = e.target;
    if (name === 'proofFile' && files[0]) {
      setForm((f) => ({ ...f, proofFile: files[0] }));
      setFilePreview(URL.createObjectURL(files[0]));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.videoLink.trim()) e.videoLink = 'Video link is required';
      if (!form.timestamp.trim()) e.timestamp = 'Timestamp is required';
      if (!form.platform) e.platform = 'Platform is required';
    }
    if (step === 1) {
      if (!form.utrId.trim()) e.utrId = 'UTR ID is required';
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
      let proofUrl = '';
      if (form.proofFile) {
        const storageRef = ref(storage, `submissions/${id}/${Date.now()}_${form.proofFile.name}`);
        await uploadBytes(storageRef, form.proofFile);
        proofUrl = await getDownloadURL(storageRef);
      }

      const subData = {
        dealId: id,
        dealTitle: deal.title,
        creatorId: creator.id,
        creatorName: creator.name,
        videoLink: form.videoLink,
        timestamp: form.timestamp,
        platform: form.platform,
        deliverableNotes: form.deliverableNotes,
        amount: form.amount,
        utrId: form.utrId,
        proofUrl,
        status: 'submitted',
        submittedAt: serverTimestamp(),
      };

      if (existingSubId) {
        await updateDoc(doc(db, 'portal_submissions', existingSubId), subData);
      } else {
        await addDoc(collection(db, 'portal_submissions'), subData);
      }

      // Update deal status
      await updateDoc(doc(db, 'portal_deals', id), {
        status: 'submitted',
        updatedAt: serverTimestamp(),
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
      <div className="portal-submit-layout">
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
              <h2>Content Proof</h2>
              <p className="portal-step-desc">Provide details about the content you published for this deal.</p>

              <div className="portal-field">
                <label htmlFor="videoLink">Video / Post Link *</label>
                <input
                  id="videoLink" name="videoLink" type="url"
                  placeholder="https://youtube.com/watch?v=…"
                  value={form.videoLink} onChange={handleChange}
                />
                {errors.videoLink && <span className="portal-field-error">{errors.videoLink}</span>}
              </div>

              <div className="portal-field">
                <label htmlFor="timestamp">Timestamp / Mention Time *</label>
                <input
                  id="timestamp" name="timestamp" type="text"
                  placeholder="e.g. 2:35 — 3:10"
                  value={form.timestamp} onChange={handleChange}
                />
                {errors.timestamp && <span className="portal-field-error">{errors.timestamp}</span>}
              </div>

              <div className="portal-field">
                <label htmlFor="platform">Platform *</label>
                <select id="platform" name="platform" value={form.platform} onChange={handleChange}>
                  <option value="">Select platform…</option>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
                {errors.platform && <span className="portal-field-error">{errors.platform}</span>}
              </div>

              <div className="portal-field">
                <label htmlFor="deliverableNotes">Deliverable Notes</label>
                <textarea
                  id="deliverableNotes" name="deliverableNotes" rows={4}
                  placeholder="Describe what was delivered, any special mentions, etc."
                  value={form.deliverableNotes} onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Step 1 — Payment Proof */}
          {step === 1 && (
            <div className="portal-step-body">
              <h2>Payment Proof</h2>
              <p className="portal-step-desc">Provide your payment details and upload a screenshot for verification.</p>

              <div className="portal-field">
                <label htmlFor="amount">Deal Amount (₹)</label>
                <input
                  id="amount" name="amount" type="text"
                  value={form.amount} readOnly
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div className="portal-field">
                <label htmlFor="utrId">UTR / Transaction ID *</label>
                <input
                  id="utrId" name="utrId" type="text"
                  placeholder="Enter UTR or transaction reference number"
                  value={form.utrId} onChange={handleChange}
                />
                {errors.utrId && <span className="portal-field-error">{errors.utrId}</span>}
              </div>

              <div className="portal-field">
                <label>Payment Screenshot</label>
                <label htmlFor="proofFile" className="portal-upload-label">
                  <Upload size={24} />
                  <span>{form.proofFile ? form.proofFile.name : 'Click to upload screenshot'}</span>
                  <input
                    id="proofFile" name="proofFile" type="file"
                    accept="image/*" onChange={handleChange} style={{ display: 'none' }}
                  />
                </label>
                {filePreview && (
                  <img src={filePreview} alt="Payment proof preview" className="portal-file-preview" />
                )}
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="portal-step-body">
              <h2>Review & Submit</h2>
              <p className="portal-step-desc">Please review all details before submitting.</p>

              <div className="portal-review-grid">
                <div className="portal-review-section">
                  <h4>Content Proof</h4>
                  <div className="portal-review-row"><span>Video Link</span><a href={form.videoLink} target="_blank" rel="noreferrer">{form.videoLink || '—'}</a></div>
                  <div className="portal-review-row"><span>Timestamp</span><strong>{form.timestamp || '—'}</strong></div>
                  <div className="portal-review-row"><span>Platform</span><strong>{form.platform || '—'}</strong></div>
                  <div className="portal-review-row"><span>Notes</span><em>{form.deliverableNotes || '—'}</em></div>
                </div>
                <div className="portal-review-section">
                  <h4>Payment Proof</h4>
                  <div className="portal-review-row"><span>Amount</span><strong>₹{Number(form.amount || 0).toLocaleString('en-IN')}</strong></div>
                  <div className="portal-review-row"><span>UTR ID</span><strong className="portal-mono">{form.utrId || '—'}</strong></div>
                  <div className="portal-review-row"><span>Screenshot</span><strong>{form.proofFile ? '✓ Attached' : 'Not uploaded'}</strong></div>
                </div>
              </div>

              {existingSubId && (
                <div className="portal-alert portal-alert--info">
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
