import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, getDoc, collection, query, where, getDocs,
  addDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Helmet } from 'react-helmet-async';
import SignatureCanvas from './components/SignatureCanvas';
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

  const [uploadMode, setUploadMode] = useState('link'); // 'link' | 'file'
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [videoFile, setVideoFile] = useState(null);
  const [videoFilePreview, setVideoFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');

  const [sigData, setSigData] = useState(null);

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
        const cq = query(collection(db, 'portal_creators'), where('uid', '==', user.uid));
        const csnap = await getDocs(cq);
        if (csnap.empty) { navigate('/portal/login'); return; }
        const creatorData = { id: csnap.docs[0].id, ...csnap.docs[0].data() };
        setCreator(creatorData);

        const dealDoc = await getDoc(doc(db, 'portal_deals', id));
        if (!dealDoc.exists()) { navigate('/portal/dashboard'); return; }
        const dealData = { id: dealDoc.id, ...dealDoc.data() };
        if (dealData.creatorId && dealData.creatorId !== creatorData.id) {
          navigate('/portal/dashboard'); return;
        }
        setDeal(dealData);

        // Pre-fill from creator profile
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

        // Set platform from deal if available
        if (dealData.platform) {
          const p = dealData.platform.toLowerCase();
          if (['youtube', 'instagram', 'facebook', 'twitter'].includes(p)) {
            setSelectedPlatform(p);
          }
        }

        const sq = query(collection(db, 'portal_submissions'), where('dealId', '==', id));
        const ssnap = await getDocs(sq);
        if (!ssnap.empty) {
          const sub = { id: ssnap.docs[0].id, ...ssnap.docs[0].data() };
          setExistingSubId(sub.id);
          setForm((f) => ({
            ...f,
            videoLink: sub.videoLink || '',
            timestamp: sub.timestamp || '',
            channelName: sub.channelName || f.channelName,
            creatorAddress: sub.creatorAddress || f.creatorAddress,
            accountHolder: sub.accountHolder || f.accountHolder,
            bankName: sub.bankName || f.bankName,
            ifscCode: sub.ifscCode || f.ifscCode,
            accountNumber: sub.accountNumber || f.accountNumber,
            upiId: sub.upiId || f.upiId,
          }));
          if (sub.signatureData) setSigData(sub.signatureData);
          if (sub.uploadedVideoUrl) {
            setUploadedVideoUrl(sub.uploadedVideoUrl);
            setUploadMode('file');
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setErrors((e) => ({ ...e, videoFile: '' }));
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setVideoFilePreview(url);
  };

  const clearFile = () => {
    setVideoFile(null);
    setVideoFilePreview(null);
    setUploadedVideoUrl('');
    setUploadProgress(0);
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (uploadMode === 'link') {
        if (!form.videoLink.trim()) e.videoLink = 'Please enter the video/content link';
        if (!form.timestamp.trim()) e.timestamp = 'Promotion timestamp is required (e.g. 2:35 – 3:10)';
      } else {
        if (!videoFile && !uploadedVideoUrl) e.videoFile = 'Please upload a video file';
        if (!form.timestamp.trim()) e.timestamp = 'Promotion timestamp is required (e.g. 2:35 – 3:10)';
      }
    }
    if (step === 1) {
      if (!form.channelName.trim()) e.channelName = 'Channel Name is required';
      if (!form.accountHolder.trim()) e.accountHolder = 'Account Holder Name is required';
      if (!form.accountNumber.trim()) e.accountNumber = 'Account Number is required';
      if (!form.bankName.trim()) e.bankName = 'Bank Name is required';
      if (!form.ifscCode.trim()) e.ifscCode = 'IFSC Code is required';
    }
    if (step === 2) {
      if (!sigData) e.signature = 'Digital signature is mandatory';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const uploadVideoFile = async () => {
    if (!videoFile) return uploadedVideoUrl || '';
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `creator_videos/${id}/${Date.now()}_${videoFile.name}`);
      const task = uploadBytesResumable(storageRef, videoFile);
      task.on('state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadProgress(pct);
        },
        reject,
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      let finalVideoUrl = '';
      if (uploadMode === 'file') {
        finalVideoUrl = await uploadVideoFile();
      }

      const subData = {
        dealId: id,
        dealTitle: deal.title,
        creatorId: creator.id,
        creatorName: creator.name,
        videoLink: uploadMode === 'link' ? form.videoLink : '',
        uploadedVideoUrl: uploadMode === 'file' ? finalVideoUrl : '',
        contentPlatform: selectedPlatform,
        uploadMode,
        timestamp: form.timestamp,
        channelName: form.channelName,
        creatorAddress: form.creatorAddress,
        accountHolder: form.accountHolder,
        bankName: form.bankName,
        ifscCode: form.ifscCode,
        accountNumber: form.accountNumber,
        upiId: form.upiId,
        billingPeriod: form.billingPeriod,
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

      // Also update the parent deal status
      await updateDoc(doc(db, 'portal_deals', id), {
        status: 'submitted_video',
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'portal_creators', creator.id), {
        channelName: form.channelName,
        creatorAddress: form.creatorAddress,
        accountHolder: form.accountHolder,
        bankName: form.bankName,
        ifscCode: form.ifscCode,
        accountNumber: form.accountNumber,
        upiId: form.upiId,
      });

      // 4. GENERATE INVOICE FROM CREATOR SIDE
      const invId = generateInvoiceId();
      await addDoc(collection(db, 'portal_invoices'), {
        invoiceId: invId,
        dealId: id,
        dealTitle: deal.title,
        creatorId: creator.id,
        creatorName: creator.name,
        creatorEmail: creator.email || '',
        creatorPhone: creator.phone || '',
        videoType: deal.videoType || '',
        amount: deal.amount || '',
        platform: selectedPlatform,
        utrId: '',
        adminProofUrl: '',
        signatureData: sigData,
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
        createdAt: serverTimestamp(),
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

              {/* Upload Mode Toggle */}
              <div className="portal-field" style={{ marginBottom: '1.5rem' }}>
                <label>Submission Method</label>
                <div className="upload-mode-toggle">
                  <button
                    type="button"
                    className={`upload-mode-btn ${uploadMode === 'link' ? 'active' : ''}`}
                    onClick={() => setUploadMode('link')}
                  >
                    <Link2 size={16} /> Paste Link
                  </button>
                  <button
                    type="button"
                    className={`upload-mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
                    onClick={() => setUploadMode('file')}
                  >
                    <Upload size={16} /> Upload Video File
                  </button>
                </div>
              </div>

              {/* Link Mode */}
              {uploadMode === 'link' && (
                <div className="portal-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {platform.icon} {platform.label} — Unlisted / Private Link *
                  </label>
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
              )}

              {/* File Upload Mode */}
              {uploadMode === 'file' && (
                <div className="portal-field">
                  <label>Upload Video File *</label>

                  {!videoFile && !uploadedVideoUrl ? (
                    <div className="video-dropzone" onClick={() => document.getElementById('videoFileInput').click()}>
                      <Film size={40} style={{ color: 'var(--portal-muted)', marginBottom: '0.75rem' }} />
                      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Click to upload video</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--portal-muted)' }}>MP4, MOV, AVI — Max 500MB</p>
                      <input
                        id="videoFileInput"
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                      />
                    </div>
                  ) : (
                    <div className="video-preview-wrap">
                      {videoFilePreview ? (
                        <video src={videoFilePreview} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '240px', background: '#000' }} />
                      ) : uploadedVideoUrl ? (
                        <video src={uploadedVideoUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '240px', background: '#000' }} />
                      ) : null}
                      <div className="video-file-info">
                        <span>{videoFile?.name || 'Previously uploaded video'}</span>
                        <button type="button" className="portal-btn portal-btn--ghost" onClick={clearFile} style={{ padding: '0.25rem 0.75rem' }}>
                          <X size={14} /> Remove
                        </button>
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="upload-progress-bar">
                          <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                          <span>{uploadProgress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  {errors.videoFile && <span className="portal-field-error">{errors.videoFile}</span>}
                </div>
              )}

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

          {/* ── Step 2 — Digital Signature ── */}
          {step === 2 && (
            <div className="portal-step-body">
              <h2>Digital Signature</h2>
              <p className="portal-step-desc">
                Please draw your signature below. This will be attached to your invoice once payment is received.
              </p>
              <div style={{ marginTop: '1rem', border: errors.signature ? '2px solid red' : 'none', borderRadius: '8px' }}>
                <SignatureCanvas onSignature={setSigData} />
              </div>
              {errors.signature && (
                <span className="portal-field-error" style={{ display: 'block', marginTop: '0.5rem' }}>
                  {errors.signature}
                </span>
              )}
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
                {submitting
                  ? uploadMode === 'file' && uploadProgress > 0 && uploadProgress < 100
                    ? `Uploading ${uploadProgress}%…`
                    : <span className="portal-btn-spinner" />
                  : '🚀 Submit Deal'}
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
