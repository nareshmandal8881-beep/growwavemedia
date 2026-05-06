import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Helmet } from 'react-helmet-async';
import CommentThread from './components/CommentThread';
import {
  Upload, CheckCircle2, ArrowLeft, ArrowRight,
  Link2, Film, X
} from 'lucide-react';
import { FaYoutube, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

const STEPS = ['Content Proof', 'Billing Details', 'Digital Signature'];

const PLATFORM_OPTIONS = [
  { value: 'youtube', label: 'YouTube', icon: <FaYoutube />, color: '#ff0000' },
  { value: 'instagram', label: 'Instagram', icon: <FaInstagram />, color: '#e1306c' },
  { value: 'facebook', label: 'Facebook', icon: <FaFacebook />, color: '#1877f2' },
  { value: 'twitter', label: 'Twitter / X', icon: <FaTwitter />, color: '#000' },
  { value: 'other', label: 'Other Link', icon: <Link2 size={16} />, color: '#6366f1' },
];

function generateInvoiceId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
}

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

  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [sigFile, setSigFile] = useState(null);
  const [sigPreview, setSigPreview] = useState(null);
  const [sigUploadProgress, setSigUploadProgress] = useState(0);
  const [uploadedSigUrl, setUploadedSigUrl] = useState('');
  const [subTask, setSubTask] = useState(''); 

  const API_BASE = 'http://localhost:5000/api';

  const [form, setForm] = useState({
    videoLink: '',
    timestamp: '',
    channelName: '',
    creatorAddress: '',
    accountHolder: '',
    bankName: '',
    ifscCode: '',
    accountNumber: '',
    upiId: '',
    billingPeriod: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/portal/login'); return; }
      setLoading(true);
      try {
        // 1. Fetch creator profile from MongoDB
        const cres = await fetch(`${API_BASE}/creators/uid/${user.uid}`);
        if (!cres.ok) { 
          await auth.signOut();
          navigate('/portal/login'); 
          return; 
        }
        const creatorData = await cres.json();
        setCreator(creatorData);

        // 2. Fetch deal details from MongoDB
        const dres = await fetch(`${API_BASE}/deals/${id}`);
        if (!dres.ok) { navigate('/portal/dashboard'); return; }
        const dealData = await dres.json();
        setDeal(dealData);

        // 3. Check for existing submission in MongoDB
        const sres = await fetch(`${API_BASE}/submissions/deal/${id}`);
        if (sres.ok) {
          const sub = await sres.json();
          if (sub) {
            setExistingSubId(sub._id);
            setForm((f) => ({
              ...f,
              videoLink: sub.videoLink || '',
              timestamp: sub.timestamp || '',
              channelName: sub.channelName || f.channelName || '',
              creatorAddress: sub.creatorAddress || f.creatorAddress || '',
              accountHolder: sub.accountHolder || f.accountHolder || '',
              bankName: sub.bankName || f.bankName || '',
              ifscCode: sub.ifscCode || f.ifscCode || '',
              accountNumber: sub.accountNumber || f.accountNumber || '',
              upiId: sub.upiId || f.upiId || '',
            }));
            if (sub.signatureUrl) {
              setUploadedSigUrl(sub.signatureUrl);
              setSigPreview(sub.signatureUrl);
            }
          } else {
            // Pre-fill from creator profile if no submission yet
            setForm((f) => ({
              ...f,
              channelName: creatorData.channelName || '',
              creatorAddress: creatorData.creatorAddress || '',
              accountHolder: creatorData.accountHolder || '',
              bankName: creatorData.bankName || '',
              ifscCode: creatorData.ifscCode || '',
              accountNumber: creatorData.accountNumber || '',
              upiId: creatorData.upiId || '',
            }));
          }
        }

        // Set platform from deal if available
        if (dealData.platform) {
          const p = dealData.platform.toLowerCase();
          if (['youtube', 'instagram', 'facebook', 'twitter'].includes(p)) {
            setSelectedPlatform(p);
          }
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


  const handleSigSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Signature file must be under 5 MB');
        return;
      }
      setSigFile(file);
      setSigPreview(URL.createObjectURL(file));
      setUploadedSigUrl('');
    }
  };


  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.videoLink.trim()) e.videoLink = 'Please enter the video/content link';
      if (!form.timestamp.trim()) e.timestamp = 'Promotion timestamp is required (e.g. 2:35 – 3:10)';
    }
    if (step === 1) {
      if (!form.channelName.trim()) e.channelName = 'Channel Name is required';
      if (!form.accountHolder.trim()) e.accountHolder = 'Account Holder Name is required';
      if (!form.accountNumber.trim()) e.accountNumber = 'Account Number is required';
      if (!form.bankName.trim()) e.bankName = 'Bank Name is required';
      if (!form.ifscCode.trim()) e.ifscCode = 'IFSC Code is required';
    }
    if (step === 2) {
      if (!sigFile && !uploadedSigUrl) e.signature = 'Signature upload is mandatory';
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
      let finalVideoUrl = '';

      const convertSigToBase64 = async () => {
        if (!sigFile) return uploadedSigUrl || '';
        setSubTask('Processing Signature...');
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(sigFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      };

      const base64Sig = await convertSigToBase64();

      setSubTask('Saving Submission...');
      const subData = {
        dealId: id,
        dealTitle: deal.title,
        creatorId: creator._id,
        creatorName: creator.name,
        videoLink: form.videoLink,
        uploadedVideoUrl: '',
        contentPlatform: selectedPlatform,
        uploadMode: 'link',
        timestamp: form.timestamp,
        channelName: form.channelName,
        creatorAddress: form.creatorAddress,
        accountHolder: form.accountHolder,
        bankName: form.bankName,
        ifscCode: form.ifscCode,
        accountNumber: form.accountNumber,
        upiId: form.upiId,
        billingPeriod: form.billingPeriod,
        signatureData: base64Sig,
        amount: deal.amount || '',
        videoType: deal.videoType || '',
        status: 'submitted_video',
      };

      const sres = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subData)
      });
      if (!sres.ok) throw new Error('Failed to save submission');

      setSubTask('Updating Deal...');
      await fetch(`${API_BASE}/deals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'submitted_video' })
      });

      setSubTask('Syncing Profile...');
      await fetch(`${API_BASE}/creators/${creator._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName: form.channelName,
          creatorAddress: form.creatorAddress,
          accountHolder: form.accountHolder,
          bankName: form.bankName,
          ifscCode: form.ifscCode,
          accountNumber: form.accountNumber,
          upiId: form.upiId,
        })
      });

      setSubTask('Generating Invoice...');
      const invId = generateInvoiceId();
      await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invId,
          dealId: id,
          dealTitle: deal.title,
          creatorId: creator._id,
          creatorName: creator.name,
          creatorEmail: creator.email || '',
          creatorPhone: creator.phone || '',
          videoType: deal.videoType || '',
          amount: deal.amount || '',
          platform: selectedPlatform,
          utrId: '',
          adminProofUrl: '',
          signatureUrl: finalSigUrl,
          channelName: form.channelName,
          creatorAddress: form.creatorAddress,
          accountHolder: form.accountHolder,
          bankName: form.bankName,
          ifscCode: form.ifscCode,
          accountNumber: form.accountNumber,
          upiId: form.upiId,
          billingPeriod: form.billingPeriod,
          status: 'pending_payment',
          date: new Date().toLocaleDateString('en-IN'),
        })
      });

      setSubTask('Done!');
      setSubmitted(true);
    } catch (err) {
      console.error("FULL SUBMISSION ERROR:", err);
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
      setSubTask('');
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

  if (!deal) {
    return (
      <div className="portal-submit-layout">
        <div className="portal-submit-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <X size={48} style={{ color: 'var(--portal-danger)', marginBottom: '1rem' }} />
          <h2>Deal Not Found</h2>
          <p style={{ color: 'var(--portal-muted)', marginBottom: '2rem' }}>
            The deal you are looking for does not exist or you do not have permission to view it.
          </p>
          <Link to="/portal/dashboard" className="portal-btn portal-btn--primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="portal-success-screen">
        <div className="portal-success-icon"><CheckCircle2 size={64} color="#34d399" /></div>
        <h2>Submission Received!</h2>
        <p>Your content proof has been submitted. The admin will review and process your payment.</p>
        <Link to="/portal/dashboard" className="portal-btn portal-btn--primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const platform = PLATFORM_OPTIONS.find(p => p.value === selectedPlatform) || PLATFORM_OPTIONS[0];

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

          {/* ── Step 0 — Content Proof ── */}
          {step === 0 && (
            <div className="portal-step-body">
              <h2>Content Submission</h2>
              <p className="portal-step-desc">
                Submit your promotional content proof — paste a link <strong>or</strong> upload your video file directly.
              </p>

              {/* Platform Selector */}
              <div className="portal-field" style={{ marginBottom: '1.5rem' }}>
                <label>Content Platform</label>
                <div className="platform-pill-row">
                  {PLATFORM_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`platform-pill ${selectedPlatform === opt.value ? 'active' : ''}`}
                      style={selectedPlatform === opt.value ? { borderColor: opt.color, background: opt.color + '22', color: opt.color } : {}}
                      onClick={() => setSelectedPlatform(opt.value)}
                    >
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="portal-field">
                <label htmlFor="videoLink">Content / Video Link *</label>
                <input
                  id="videoLink"
                  name="videoLink"
                  type="url"
                  placeholder={
                    selectedPlatform === 'youtube' ? 'https://youtube.com/watch?v=…' :
                    selectedPlatform === 'instagram' ? 'https://instagram.com/reel/…' :
                    selectedPlatform === 'facebook' ? 'https://facebook.com/video/…' :
                    'Paste your unlisted content link…'
                  }
                  value={form.videoLink}
                  onChange={handleChange}
                />
                {errors.videoLink && <span className="portal-field-error">{errors.videoLink}</span>}
                <p style={{ fontSize: '0.8rem', color: 'var(--portal-muted)', marginTop: '0.4rem' }}>
                  ⚠️ Make sure the link is unlisted/private (not public). The admin will review it.
                </p>
              </div>

              {/* Timestamp - always shown */}
              <div className="portal-field" style={{ marginTop: '1.5rem' }}>
                <label htmlFor="timestamp">Promotion Timestamp *</label>
                <input
                  id="timestamp"
                  name="timestamp"
                  type="text"
                  placeholder="e.g. 2:35 — 3:10 (where the brand integration appears)"
                  value={form.timestamp}
                  onChange={handleChange}
                />
                {errors.timestamp && <span className="portal-field-error">{errors.timestamp}</span>}
              </div>
            </div>
          )}

          {/* ── Step 1 — Billing Details ── */}
          {step === 1 && (
            <div className="portal-step-body">
              <h2>Billing & Payment Details</h2>
              <p className="portal-step-desc">
                Provide your official billing information for the invoice.
              </p>
              
              <div className="portal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="portal-field">
                  <label>Channel Name *</label>
                  <input name="channelName" value={form.channelName} onChange={handleChange} placeholder="e.g. I am Biswajit" />
                  {errors.channelName && <span className="portal-field-error">{errors.channelName}</span>}
                </div>
                <div className="portal-field">
                  <label>Billing Period</label>
                  <input name="billingPeriod" value={form.billingPeriod} onChange={handleChange} placeholder="e.g. May 2026" />
                </div>
                <div className="portal-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Creator / Billing Address</label>
                  <textarea name="creatorAddress" rows="2" value={form.creatorAddress} onChange={handleChange} placeholder="Assam, Sonitpur, Pin: 784507" />
                </div>
                <div className="portal-field">
                  <label>Account Holder Name *</label>
                  <input name="accountHolder" value={form.accountHolder} onChange={handleChange} placeholder="Full name as per bank" />
                  {errors.accountHolder && <span className="portal-field-error">{errors.accountHolder}</span>}
                </div>
                <div className="portal-field">
                  <label>Bank Name *</label>
                  <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. Bank of Baroda" />
                  {errors.bankName && <span className="portal-field-error">{errors.bankName}</span>}
                </div>
                <div className="portal-field">
                  <label>IFSC Code *</label>
                  <input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="e.g. BARB0DHEKIA" className="portal-mono" />
                  {errors.ifscCode && <span className="portal-field-error">{errors.ifscCode}</span>}
                </div>
                <div className="portal-field">
                  <label>Account Number *</label>
                  <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="0000 0000 0000" className="portal-mono" />
                  {errors.accountNumber && <span className="portal-field-error">{errors.accountNumber}</span>}
                </div>
                <div className="portal-field">
                  <label>UPI ID (Optional)</label>
                  <input name="upiId" value={form.upiId} onChange={handleChange} placeholder="johndoe@upi" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 — Upload Signature ── */}
          {step === 2 && (
            <div className="portal-step-body">
              <h2>Upload Signature</h2>
              <p className="portal-step-desc">
                Please upload a clear image of your signature (Max 50 KB). 
                You can sign on paper and take a photo.
              </p>
              
              <div className="portal-field" style={{ marginTop: '1.5rem' }}>
                <div 
                  className="video-dropzone" 
                  onClick={() => document.getElementById('sigFileInput').click()}
                  style={{ minHeight: '150px', borderStyle: 'dashed' }}
                >
                  {sigPreview ? (
                    <img src={sigPreview} alt="Signature Preview" style={{ maxHeight: '100px', maxWidth: '100%' }} />
                  ) : (
                    <>
                      <Upload size={32} style={{ color: 'var(--portal-muted)', marginBottom: '0.5rem' }} />
                      <p style={{ fontWeight: 600 }}>Click to upload signature</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--portal-muted)' }}>PNG, JPG — Max 50 KB</p>
                    </>
                  )}
                  <input
                    id="sigFileInput"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleSigSelect}
                  />
                </div>
                {errors.signature && <span className="portal-field-error">{errors.signature}</span>}
                
                {sigUploadProgress > 0 && sigUploadProgress < 100 && (
                  <div className="upload-progress-bar" style={{ marginTop: '1rem' }}>
                    <div className="upload-progress-fill" style={{ width: `${sigUploadProgress}%` }} />
                    <span>Uploading Signature…</span>
                  </div>
                )}
              </div>

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
                style={{ minWidth: '160px' }}
              >
                {submitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="portal-btn-spinner" />
                    <span>{subTask || 'Processing...'}</span>
                  </div>
                ) : (
                  '🚀 Submit Deal'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Comment Thread */}
        {existingSubId && (
          <div className="portal-submit-comments" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <CommentThread submissionId={existingSubId} isAdmin={false} />
          </div>
        )}
      </div>
    </>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div className="portal-step-indicator">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`portal-step ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            <div className="portal-step__dot">
              {i < current ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className="portal-step__label">{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`portal-step__line ${i < current ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}
