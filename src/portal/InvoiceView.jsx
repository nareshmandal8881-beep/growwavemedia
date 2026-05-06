import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, getDoc, updateDoc, serverTimestamp, collection, addDoc,
} from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import StatusBadge from './components/StatusBadge';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

function generateInvoiceId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ymd}-${rand}`;
}

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        const invDoc = await getDoc(doc(db, 'portal_invoices', id));
        if (!invDoc.exists()) { navigate('/portal/dashboard'); return; }
        const data = { id: invDoc.id, ...invDoc.data() };
        setInvoice(data);
        // Check if this is the creator's own invoice or admin is viewing
        const isAdminView = localStorage.getItem('waveAdminToken') === 'authenticated_success';
        setIsCreator(!isAdminView && !!user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [id, navigate]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-spinner" />
        <p>Loading invoice…</p>
      </div>
    );
  }

  if (!invoice) return null;


  return (
    <>
      <Helmet>
        <title>Invoice {invoice.invoiceId} | Creator Portal</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="portal-invoice-layout">
        <div className="portal-invoice-topbar no-print">
          <Link to="/portal/dashboard" className="portal-back-link">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <button className="portal-btn portal-btn--ghost" onClick={handlePrint}>🖨 Print</button>
        </div>

        <div className="portal-invoice-doc" id="invoice-doc">
          {/* Header */}
          <div className="inv-header">
            <div className="inv-brand">
              <h1 className="inv-brand__name">Grow Wave Media</h1>
              <p className="inv-brand__tag">Digital Marketing & Influencer Agency</p>
              <p className="inv-brand__contact">growwavemedia@gmail.com</p>
            </div>
            <div className="inv-meta">
              <div className="inv-badge">INVOICE</div>
              <table className="inv-meta-table">
                <tbody>
                  <tr><td>Invoice ID</td><td className="portal-mono">{invoice.invoiceId}</td></tr>
                  <tr><td>Date</td><td>{invoice.date}</td></tr>
                  <tr><td>Status</td><td><StatusBadge status={invoice.status} /></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Parties */}
          <div className="inv-parties">
            <div className="inv-party">
              <p className="inv-party__label">FROM</p>
              <p className="inv-party__name">Grow Wave Media</p>
              <p>Arghyadip Naskar, Founder</p>
              <p>growwavemedia@gmail.com</p>
            </div>
            <div className="inv-party">
              <p className="inv-party__label">TO (Creator)</p>
              <p className="inv-party__name">{invoice.creatorName}</p>
              <p>{invoice.creatorEmail}</p>
              <p>{invoice.creatorPhone || ''}</p>
            </div>
          </div>

          {/* Deal Details */}
          <div className="inv-section">
            <h3 className="inv-section__title">Deal Details</h3>
            <table className="inv-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Platform</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>{invoice.dealTitle}</td>
                  <td>{invoice.platform || '—'}</td>
                  <td>₹{Number(invoice.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total</td>
                  <td className="inv-total">₹{Number(invoice.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Details */}
          <div className="inv-section">
            <h3 className="inv-section__title">Payment Reference</h3>
            <div className="inv-payment-grid">
              <div><span>UTR / Transaction ID</span><strong className="portal-mono">{invoice.utrId || '—'}</strong></div>
              <div><span>Payment Method</span><strong>Bank Transfer / UPI</strong></div>
            </div>
          </div>

          {/* Payment Receipt / Proof from Admin */}
          {invoice.adminProofUrl && (
            <div className="inv-section">
              <h3 className="inv-section__title">Payment Receipt</h3>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--portal-muted)', marginBottom: '0.75rem' }}>
                  Payment screenshot uploaded by Grow Wave Media admin as proof of transfer.
                </p>
                <img
                  src={invoice.adminProofUrl}
                  alt="Payment receipt proof"
                  style={{
                    maxWidth: '400px',
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'block',
                  }}
                />
                <a
                  href={invoice.adminProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="portal-btn portal-btn--ghost"
                  style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  🔗 View / Download Receipt
                </a>
              </div>
            </div>
          )}

          {/* Signature Section */}
          {invoice.signatureData ? (
            <div className="inv-sig-section">
              <h3 className="inv-section__title">Creator Signature</h3>
              <div className="inv-sig-display">
                <img src={invoice.signatureData} alt="Creator signature" className="inv-sig-img" />
                <p className="inv-sig-name">{invoice.creatorName}</p>
                <p className="inv-sig-date">Signed electronically during submission.</p>
              </div>
            </div>
          ) : (
            <div className="inv-sig-section no-print">
              <p style={{ color: 'var(--portal-muted)' }}>No signature attached.</p>
            </div>
          )}

          {/* Footer */}
          <div className="inv-footer">
            <p>Thank you for working with Grow Wave Media. This invoice is computer-generated.</p>
          </div>
        </div>
      </div>
    </>
  );
}
