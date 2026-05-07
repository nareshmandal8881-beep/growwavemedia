import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, getDoc,
} from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import StatusBadge from './components/StatusBadge';
import { ArrowLeft, Printer } from 'lucide-react';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/invoices/${id}`);
        if (!res.ok) { navigate('/portal/dashboard'); return; }
        const data = await res.json();
        setInvoice(data);
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
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button className="portal-btn portal-btn--ghost" onClick={handlePrint}>
            <Printer size={16} /> Print Invoice
          </button>
        </div>

        <div className="portal-invoice-doc" id="invoice-doc">
          {/* Header */}
          <div className="inv-header">
            <div className="inv-brand">
              <h1 className="inv-brand__name">INVOICE</h1>
              <p className="inv-brand__tag">Professional Services Receipt</p>
            </div>
            <div className="inv-meta">
              <table className="inv-meta-table">
                <tbody>
                  <tr>
                    <td><strong>Invoice ID</strong></td>
                    <td className="portal-mono">{invoice.invoiceId}</td>
                  </tr>
                  <tr>
                    <td><strong>Invoice Date</strong></td>
                    <td>{invoice.date}</td>
                  </tr>
                  <tr>
                    <td><strong>Billing Period</strong></td>
                    <td>{invoice.billingPeriod || 'May 2026'}</td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td><StatusBadge status={invoice.status} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Parties */}
          <div className="inv-parties">
            <div className="inv-party">
              <div className="inv-party__label">Billed By (Service Provider)</div>
              <div className="inv-party__name">{invoice.channelName || 'I am Biswajit'}</div>
              <p><strong>Owner Name:</strong> {invoice.creatorName || 'Biswajit Rabha'}</p>
              <p style={{ whiteSpace: 'pre-line' }}>
                {invoice.creatorAddress || 'Assam, Sonitpur\nPin: 784507'}
              </p>
            </div>
            <div className="inv-party">
              <div className="inv-party__label">Billed To (Client Details)</div>
              <div className="inv-party__name">Grow Wave Media</div>
              <p>Nutangram, Swarupnagar</p>
              <p>West Bengal – 743286</p>
              <p>growwavemedia@gmail.com</p>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="inv-section">
            <div className="inv-section__title">Service / Invoice Breakdown</div>
            <table className="inv-items-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Sl.</th>
                  <th>Service Description</th>
                  <th>Service Date</th>
                  <th>Payment Date</th>
                  <th>Transaction ID</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    <strong>Integration</strong><br />
                    Promotion on {invoice.platform || 'YouTube'}
                  </td>
                  <td>{invoice.date}</td>
                  <td>{invoice.paidAt ? new Date(invoice.paidAt.seconds * 1000).toLocaleDateString('en-IN') : invoice.date}</td>
                  <td className="portal-mono">{invoice.utrId || 'AXOMB12102074463'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{Number(invoice.amount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700 }}>Subtotal</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{Number(invoice.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', fontWeight: 800 }}>Total Amount Payable</td>
                  <td className="inv-total" style={{ textAlign: 'right' }}>₹{Number(invoice.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Details */}
          <div className="inv-section">
            <div className="inv-section__title">Payment Details</div>
            <div className="inv-payment-grid">
              <div className="inv-payment-item">
                <span>Account Holder Name</span>
                <strong>{invoice.accountHolder || 'Gana Rabha'}</strong>
              </div>
              <div className="inv-payment-item">
                <span>Bank Name</span>
                <strong>{invoice.bankName || 'Bank Of Baroda'}</strong>
              </div>
              <div className="inv-payment-item">
                <span>IFSC Code</span>
                <strong>{invoice.ifscCode || 'BARBODHEKIA'}</strong>
              </div>
              <div className="inv-payment-item">
                <span>Account Number</span>
                <strong className="portal-mono">{invoice.accountNumber || '46878100022743'}</strong>
              </div>
              <div className="inv-payment-item">
                <span>UPI ID</span>
                <strong>{invoice.upiId || 'NIL'}</strong>
              </div>
            </div>
          </div>

          {/* Admin Proof (Receipt) */}
          {invoice.adminProofUrl && (
            <div className="inv-section no-print">
              <div className="inv-section__title">Admin Payment Receipt</div>
              <div style={{ marginTop: '1rem' }}>
                <img
                  src={invoice.adminProofUrl}
                  alt="Payment receipt proof"
                  style={{
                    maxWidth: '300px',
                    borderRadius: '4px',
                    border: '1px solid #eee',
                  }}
                />
              </div>
            </div>
          )}

          {/* Declaration & Signature */}
          <div className="inv-section" style={{ marginTop: '4rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic', maxWidth: '500px' }}>
              <strong>Declaration:</strong> I hereby declare that the information provided in this invoice is true and correct and the services mentioned above have been delivered as per agreement.
            </p>
            
            <div className="inv-sig-section">
              <div className="inv-sig-display">
                {(invoice.signatureUrl || invoice.signatureData) && (
                  invoice.signatureData ? (
                    <img src={invoice.signatureData} alt="Authorized Signature" className="inv-sig-img" />
                  ) : invoice.signatureUrl?.includes('firebasestorage') ? (
                    <img src={invoice.signatureUrl} alt="Authorized Signature" className="inv-sig-img" />
                  ) : (
                    <div style={{ marginBottom: '1rem' }}>
                      <a href={invoice.signatureUrl} target="_blank" rel="noreferrer" style={{color: '#3b82f6', textDecoration: 'underline', fontSize: '0.9rem', wordBreak: 'break-all'}}>
                        🔗 Attached Google Drive Signature
                      </a>
                    </div>
                  )
                )}
                <div className="inv-sig-line">
                  <div className="inv-sig-name">Authorized Signature</div>
                  <div className="inv-sig-date">Name: {invoice.creatorName}</div>
                  <div className="inv-sig-date">Date: {invoice.date}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="inv-footer">
            <p>Thank you for your business!</p>
            <p style={{ marginTop: '0.5rem' }}>This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
