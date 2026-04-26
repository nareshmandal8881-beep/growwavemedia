import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function TermsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '6rem 0 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '64px 64px', pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,207,255,0.14) 0%, transparent 70%)', top: '-200px', left: '-100px', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '2.5rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(56,207,255,0.08)', border: '1px solid rgba(56,207,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '1.75rem' }}>
            <FileText size={34} />
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.6rem' }}>Legal</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.05, margin: '0 0 1rem', background: 'linear-gradient(135deg, #fff 60%, rgba(56,207,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px', lineHeight: 1.75 }}>
            Last updated: April 26, 2026. By using our services, you agree to these terms. Please read them carefully.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '5rem 0', background: '#0e0e12' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          {[
            {
              title: '1. Acceptance of Terms',
              body: `By accessing and using the Grow Wave Media website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.`
            },
            {
              title: '2. Services Provided',
              body: `Grow Wave Media provides digital marketing services including but not limited to Influencer Marketing, Social Media Management, Meta Ads, Google Ads, Video Editing, UGC Video Production, Graphic Design, and Website Development. The scope and deliverables of services will be defined in individual service agreements.`
            },
            {
              title: '3. Client Responsibilities',
              body: `Clients are responsible for providing accurate and complete information required to deliver services, obtaining necessary rights and permissions for any content provided to us, and adhering to payment schedules as agreed in service contracts.`
            },
            {
              title: '4. Payment Terms',
              body: `Payment terms will be specified in individual service agreements. We reserve the right to pause or discontinue services in the event of non-payment. All fees are non-refundable unless otherwise agreed in writing prior to commencement of services.`
            },
            {
              title: '5. Intellectual Property',
              body: `Upon full payment, clients receive ownership of final deliverables created specifically for them. Grow Wave Media retains the right to showcase work in our portfolio unless explicitly agreed otherwise. All tools, methodologies, and processes remain the property of Grow Wave Media.`
            },
            {
              title: '6. Confidentiality',
              body: `Both parties agree to keep confidential any proprietary information shared during the course of our engagement. This obligation survives the termination of any service agreement.`
            },
            {
              title: '7. Limitation of Liability',
              body: `Grow Wave Media shall not be liable for indirect, incidental, or consequential damages arising from the use of our services. Our total liability in any matter arising out of or related to these terms is limited to the amount paid by the client in the previous 30 days.`
            },
            {
              title: '8. Termination',
              body: `Either party may terminate services with 30 days written notice. Upon termination, the client is responsible for payment of all services rendered up to the termination date. Grow Wave Media will deliver all completed work upon receipt of outstanding payments.`
            },
            {
              title: '9. Governing Law',
              body: `These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal.`
            },
            {
              title: '10. Contact Us',
              body: `For any questions regarding these Terms and Conditions, please contact us at growwavemedia@gmail.com or call +91 70633 63898.`
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: '2.5rem', padding: '2rem 2.5rem', background: '#111218', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '2px', transition: 'border-color 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(56,207,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.3px', color: '#fff', marginBottom: '0.75rem' }}>{section.title}</h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.85 }}>{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
