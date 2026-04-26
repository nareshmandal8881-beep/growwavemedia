import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckSquare, FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const docs = [
  {
    id: 'udyam',
    label: 'Govt. of India · MSME',
    title: 'Udyam Registration Certificate',
    desc: 'Registered under the Ministry of Micro, Small & Medium Enterprises, Government of India. This certificate confirms that Grow Wave Media is a recognised micro enterprise operating in the services sector.',
    file: '/udyam-certificate.pdf',
    btnText: 'Open Full Certificate',
    color: '#38CFFF',
    bg: 'rgba(56,207,255,0.08)',
    border: 'rgba(56,207,255,0.25)',
    borderHover: 'rgba(56,207,255,0.5)',
    icon: <CheckSquare size={28} />,
    meta: [
      { label: 'Category',    value: 'Micro Enterprise' },
      { label: 'Sector',      value: 'Services' },
      { label: 'Issued By',   value: 'Govt. of India' },
      { label: 'Status',      value: 'Active ✓', green: true },
    ],
  },
  {
    id: 'trade',
    label: 'Municipal Corporation · West Bengal',
    title: 'Trade License',
    desc: 'Officially licensed to operate as a digital marketing and media services business in West Bengal. This license is issued by the relevant municipal authority and is renewed periodically.',
    file: '/trade-license.pdf',
    btnText: 'Open Full License',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.25)',
    borderHover: 'rgba(129,140,248,0.5)',
    icon: <FileText size={28} />,
    meta: [
      { label: 'Issued By', value: 'Kolkata, WB' },
      { label: 'Business',  value: 'Digital Marketing' },
      { label: 'Authority', value: 'Municipal Corp.' },
      { label: 'Status',    value: 'Active ✓', green: true },
    ],
  },
];

function DocCard({ doc }) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: '#111218',
        border: `1px solid ${hovered ? doc.borderHover : doc.border}`,
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.4)` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card header */}
      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: doc.bg, border: `1px solid ${doc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: doc.color, flexShrink: 0 }}>
            {doc.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: doc.color, marginBottom: '0.4rem' }}>{doc.label}</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#fff', marginBottom: '0.5rem' }}>{doc.title}</h2>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{doc.desc}</p>
          </div>
        </div>

        {/* Meta pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {doc.meta.map((m, i) => (
            <div key={i} style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{m.label}: </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.green ? '#4ade80' : '#fff' }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: doc.bg, border: `1px solid ${doc.border}`, color: doc.color, fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide Document' : 'View Document'}
          </button>
          <a
            href={doc.file}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <ExternalLink size={14} /> {doc.btnText}
          </a>
        </div>
      </div>

      {/* Embedded PDF viewer */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${doc.border}`, background: '#0a0a0a', padding: '1.5rem' }}>
          <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${doc.border}` }}>
            <iframe
              src={doc.file}
              title={doc.title}
              width="100%"
              height="680px"
              style={{ display: 'block', border: 'none', background: '#fff' }}
            />
          </div>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.75rem', textAlign: 'center' }}>
            If the document does not load, <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ color: doc.color, textDecoration: 'underline' }}>click here to open it directly</a>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CompliancePage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '6rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)', top: '-250px', right: '-200px', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '2.5rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div style={{ width: '76px', height: '76px', borderRadius: '20px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', marginBottom: '1.75rem' }}>
            <Shield size={36} />
          </div>

          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#4ade80', marginBottom: '0.75rem' }}>Legal · Governance</div>

          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.05, margin: '0 0 1.5rem', background: 'linear-gradient(135deg, #fff 55%, rgba(74,222,128,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Compliance &amp; Registrations
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', maxWidth: '680px', lineHeight: 1.85 }}>
            We adhere to the highest standards of corporate governance and legal compliance. On this page, you will find access to our critical registration and certification documents, such as our Trade License and Udyam Certificate. These documents serve as a public testament to our commitment to operating with integrity and meeting all regulatory requirements. We believe this transparency builds trust with our valued clients and partners.
          </p>

          {/* Trust badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
            {['MSME Registered', 'Trade Licensed', 'Govt. Verified', 'Transparent Business'].map((badge, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '100px' }}>
                <Shield size={12} color="#4ade80" />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.5px' }}>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTS ── */}
      <section style={{ padding: '5rem 0', background: '#0e0e12' }}>
        <div className="container" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {docs.map(doc => <DocCard key={doc.id} doc={doc} />)}
        </div>
      </section>

      {/* ── VERIFIED STATUS STRIP ── */}
      <section style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#4ade80', marginBottom: '1rem' }}>Verified Status</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', marginBottom: '2rem' }}>
            Grow Wave Media is a Fully Registered &amp; Licensed Business
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

            {/* MSME Badge */}
            <a
              href="/udyam-certificate.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem 2rem', background: 'rgba(56,207,255,0.05)', border: '1px solid rgba(56,207,255,0.25)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,207,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(56,207,255,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(56,207,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,207,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(56,207,255,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(56,207,255,0.1)', border: '2px solid rgba(56,207,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.6rem', color: '#38CFFF', lineHeight: 1 }}>✓</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#fff', marginBottom: '0.25rem' }}>MSME Registered</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>Udyam Registration · Govt. of India</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38CFFF', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ExternalLink size={11} /> View Certificate
                </div>
              </div>
            </a>

            {/* Trade License Badge */}
            <a
              href="/trade-license.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem 2rem', background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.1)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(129,140,248,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.05)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(129,140,248,0.1)', border: '2px solid rgba(129,140,248,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.6rem', color: '#818cf8', lineHeight: 1 }}>✓</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#fff', marginBottom: '0.25rem' }}>Trade Licensed</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>Municipal Corporation · West Bengal</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ExternalLink size={11} /> View License
                </div>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ── COMMITMENT STRIP ── */}
      <section style={{ background: '#111218', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <Shield size={40} color="#4ade80" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', marginBottom: '1rem' }}>
            Our Commitment to Integrity
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, marginBottom: '2rem' }}>
            Every client engagement at Grow Wave Media is backed by full legal compliance, transparent practices, and registered business operations — so you can partner with us with complete confidence.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/#contact" className="btn-solid">Book a Free Consultation</Link>
            <Link to="/about" className="btn-line" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>Learn About Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
