import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, ArrowRight, Plus, Minus, MessageCircle, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { servicesData } from './data/servicesData.jsx';

/* ── FAQ Accordion Item ───────────────────────────────────── */
function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`sdp-faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="sdp-faq-header">
        <span className="sdp-faq-q">{q}</span>
        <span className="sdp-faq-icon">{open ? <Minus size={18} /> : <Plus size={18} />}</span>
      </div>
      {open && <div className="sdp-faq-body">{a}</div>}
    </div>
  );
}

/* ── Service Detail Page ──────────────────────────────────── */
export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const service = servicesData[serviceId];
  const [lightbox, setLightbox] = useState(null); // null or { src, alt }

  // Close lightbox on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.sdp-reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [serviceId]);

  if (!service) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <Navbar />
        <div className="container" style={{ padding: '12rem 0', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>
            Service not found
          </h2>
          <Link to="/" className="btn-solid">← Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  /* Default process steps if not in data */
  const process = service.process || [
    { step: '01', title: 'Discovery & Audit', desc: 'We deep-dive into your brand, audience, and goals to build a solid foundation.' },
    { step: '02', title: 'Strategy Design', desc: 'A bespoke growth plan tailored to your vertical, budget, and KPIs.' },
    { step: '03', title: 'Execution', desc: 'Our team launches campaigns with precision, managing every moving part.' },
    { step: '04', title: 'Optimise & Scale', desc: 'Continuous data-driven refinement to maximise ROI and accelerate growth.' },
  ];

  /* Default metrics if not in data */
  const metrics = service.metrics || [
    { value: '100+', label: 'Campaigns Delivered' },
    { value: '5×',   label: 'Average ROI' },
    { value: '48h',  label: 'Avg. Onboarding' },
    { value: '98%',  label: 'Client Retention' },
  ];

  /* Default FAQs if not in data */
  const faqs = service.faqs || [
    { q: 'How quickly can we get started?', a: 'Once we have your brief and sign-off, most campaigns go live within 5–7 business days.' },
    { q: 'Do you work with early-stage startups?', a: 'Absolutely. We have flexible plans designed for every stage of growth — from seed to Series B and beyond.' },
    { q: 'How do you measure success?', a: 'We define clear KPIs upfront — reach, conversions, CAC, or ROAS — and share live dashboards so you are always in the loop.' },
    { q: 'Can I change or cancel anytime?', a: 'We work on flexible monthly retainers. No lock-ins, no surprises.' },
  ];

  const whatsappText = encodeURIComponent(
    `Hi! I'm interested in your *${service.title}* service. Can we discuss how Grow Wave Media can help my brand?`
  );

  return (
    <div className="sdp-page">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="sdp-hero">
        <div className="sdp-hero-grid-overlay" />
        <div className="sdp-hero-orb sdp-hero-orb-1" />
        <div className="sdp-hero-orb sdp-hero-orb-2" />

        <div className="container sdp-hero-inner">
          <Link to="/" className="sdp-back">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="sdp-hero-badge sdp-reveal">
            <span className="sdp-hero-icon-wrap">{service.icon}</span>
          </div>

          <h1 className="sdp-hero-h1 sdp-reveal">{service.title}</h1>
          <p className="sdp-hero-tagline sdp-reveal">{service.tagline}</p>

          <div className="sdp-hero-actions sdp-reveal">
            <a
              href={`https://wa.me/917063363898?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid"
              style={{ gap: '0.6rem', display: 'inline-flex', alignItems: 'center' }}
            >
              <MessageCircle size={17} /> Get a Free Quote
            </a>
            <Link to="/#contact" className="btn-line">
              Book a Call <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* Floating metric chips */}
        <div className="sdp-hero-chips">
          {metrics.map((m, i) => (
            <div className="sdp-chip sdp-reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="sdp-chip-val">{m.value}</span>
              <span className="sdp-chip-label">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── OVERVIEW + SIDEBAR ────────────────────────────────── */}
      <section className="sdp-body">
        <div className="container sdp-body-grid">

          {/* Main Content */}
          <div className="sdp-main">

            {/* Overview */}
            <div className="sdp-card sdp-reveal">
              <div className="sdp-card-label">Overview</div>
              <h2 className="sdp-card-h2">What We Deliver</h2>
              <p className="sdp-overview-text">{service.description}</p>
            </div>

            {/* Process Steps */}
            <div className="sdp-card sdp-reveal">
              <div className="sdp-card-label">How It Works</div>
              <h2 className="sdp-card-h2">Our Process</h2>
              <div className="sdp-process-grid">
                {process.map((p, i) => (
                  <div className="sdp-process-step sdp-reveal" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
                    <div className="sdp-step-num">{p.step}</div>
                    <h4 className="sdp-step-title">{p.title}</h4>
                    <p className="sdp-step-desc">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Gallery (only for services with videos data) */}
            {service.videos && (
              <div className="sdp-card sdp-reveal">
                <div className="sdp-card-label">Our Work</div>
                <h2 className="sdp-card-h2">Watch Our Edits</h2>
                <div className="sdp-video-grid">
                  {service.videos.map((v, i) => (
                    <div
                      key={i}
                      className={`sdp-video-item sdp-reveal ${v.type === 'short' ? 'sdp-video-short' : 'sdp-video-long'}`}
                      style={{ transitionDelay: `${i * 0.1}s` }}
                    >
                      <div className="sdp-video-badge">{v.label}</div>
                      <div className={`sdp-video-frame-wrap ${v.type === 'short' ? 'sdp-frame-short' : 'sdp-frame-long'}`}>
                        <iframe
                          src={
                            v.type === 'short'
                              ? `https://www.youtube.com/embed/${v.embedId}`
                              : `https://www.youtube.com/embed/${v.embedId}`
                          }
                          title={`${v.label} video ${i + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ border: 'none', width: '100%', height: '100%', borderRadius: '12px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery (for services with images data) */}
            {service.images && (
              <div className="sdp-card sdp-reveal">
                <div className="sdp-card-label">Our Work</div>
                <h2 className="sdp-card-h2">Design Portfolio</h2>
                <div className="sdp-img-gallery">
                  {service.images.map((img, i) => (
                    <div
                      key={i}
                      className="sdp-img-item sdp-reveal"
                      style={{ transitionDelay: `${i * 0.1}s` }}
                      onClick={() => setLightbox(img)}
                    >
                      <img src={img.src} alt={img.alt} className="sdp-gallery-img" />
                      <div className="sdp-img-overlay"><span className="sdp-img-zoom">⤢</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lightbox Modal */}
            {lightbox && (
              <div className="sdp-lightbox" onClick={() => setLightbox(null)}>
                <button className="sdp-lightbox-close" onClick={() => setLightbox(null)}>
                  <X size={24} />
                </button>
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  className="sdp-lightbox-img"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Technologies (if any) */}
            {service.technologies && (
              <div className="sdp-card sdp-reveal">
                <div className="sdp-card-label">Stack</div>
                <h2 className="sdp-card-h2">Core Technologies</h2>
                <div className="sdp-tech-grid">
                  {service.technologies.map((tech, i) => (
                    <div className="sdp-tech-item sdp-reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                      <div className="sdp-tech-icon">{tech.icon}</div>
                      <span className="sdp-tech-name">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="sdp-card sdp-reveal">
              <div className="sdp-card-label">FAQ</div>
              <h2 className="sdp-card-h2">Common Questions</h2>
              <div className="sdp-faq-list">
                {faqs.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} index={i} />
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="sdp-sidebar">

            {/* Benefits */}
            <div className="sdp-sidebar-card sdp-reveal">
              <div className="sdp-sidebar-label">Key Benefits</div>
              <ul className="sdp-benefits-list">
                {service.benefits.map((b, i) => (
                  <li key={i} className="sdp-benefit-item">
                    <CheckCircle2 size={17} className="sdp-check" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/917063363898?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sdp-sidebar-cta"
              >
                <MessageCircle size={17} /> Get a Free Quote
              </a>
            </div>

            {/* Head of department */}
            {service.head && (
              <div className="sdp-sidebar-card sdp-reveal">
                <div className="sdp-sidebar-label">Head of Department</div>
                <div className="sdp-head-card">
                  <div className="sdp-head-avatar">
                    {service.head.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="sdp-head-name">{service.head}</div>
                    <div className="sdp-head-role">{service.title} Lead</div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Services */}
            <div className="sdp-sidebar-card sdp-reveal">
              <div className="sdp-sidebar-label">Explore More</div>
              <div className="sdp-other-services">
                {Object.entries(servicesData)
                  .filter(([id]) => id !== serviceId)
                  .slice(0, 4)
                  .map(([id, svc]) => (
                    <Link to={`/services/${id}`} key={id} className="sdp-other-link">
                      <span className="sdp-other-icon">{svc.icon}</span>
                      <span>{svc.title}</span>
                      <ChevronRight size={14} className="sdp-other-arrow" />
                    </Link>
                  ))}
              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────────── */}
      <section className="sdp-cta-strip sdp-reveal">
        <div className="sdp-cta-orb" />
        <div className="container sdp-cta-inner">
          <div className="sdp-cta-left">
            <div className="eyebrow" style={{ color: '#0a0a0a', background: 'rgba(10,10,10,0.1)', borderColor: 'rgba(10,10,10,0.2)' }}>
              Ready to grow?
            </div>
            <h2 className="sdp-cta-h2">Start Your {service.title} Journey Today</h2>
            <p className="sdp-cta-desc">
              Join 100+ IT startups already scaling with Grow Wave Media. Let's build something remarkable together.
            </p>
          </div>
          <div className="sdp-cta-right">
            <a
              href={`https://wa.me/917063363898?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sdp-cta-btn"
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>
            <Link to="/#contact" className="sdp-cta-btn-outline">
              Send an Enquiry <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
