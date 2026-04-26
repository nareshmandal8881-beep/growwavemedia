import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function PrivacyPolicyPage() {
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
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,207,255,0.14) 0%, transparent 70%)', top: '-200px', right: '-150px', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '2.5rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(56,207,255,0.08)', border: '1px solid rgba(56,207,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '1.75rem' }}>
            <Shield size={34} />
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.6rem' }}>Legal</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.05, margin: '0 0 1rem', background: 'linear-gradient(135deg, #fff 60%, rgba(56,207,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', maxWidth: '540px', lineHeight: 1.75 }}>
            Last updated: April 26, 2026. This policy describes how Grow Wave Media collects, uses, and protects your information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '5rem 0', background: '#0e0e12' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          {[
            {
              title: '1. Information We Collect',
              body: `We collect information you provide directly to us, including your name, email address, phone number, and any messages you send via our contact forms or WhatsApp. We may also automatically collect certain technical information such as browser type, IP address, and pages visited when you use our website.`
            },
            {
              title: '2. How We Use Your Information',
              body: `We use the information we collect to respond to your enquiries and provide our services, to communicate with you about projects and updates, to improve our website and services, and to send you marketing communications where you have consented to receive them.`
            },
            {
              title: '3. Information Sharing',
              body: `Grow Wave Media does not sell, trade, or rent your personal information to third parties. We may share your data with trusted partners and service providers who assist us in operating our website or conducting our business, provided those parties agree to keep this information confidential.`
            },
            {
              title: '4. Cookies',
              body: `Our website may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings. However, disabling cookies may affect the functionality of certain parts of our site.`
            },
            {
              title: '5. Data Security',
              body: `We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`
            },
            {
              title: '6. Third-Party Links',
              body: `Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to read their privacy policies before providing any personal information.`
            },
            {
              title: '7. Your Rights',
              body: `You have the right to access, correct, or delete your personal data held by us. To exercise these rights, please contact us at growwavemedia@gmail.com and we will respond within a reasonable timeframe.`
            },
            {
              title: '8. Changes to This Policy',
              body: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated effective date.`
            },
            {
              title: '9. Contact Us',
              body: `If you have any questions about this Privacy Policy, please contact us at growwavemedia@gmail.com or call +91 70633 63898.`
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
