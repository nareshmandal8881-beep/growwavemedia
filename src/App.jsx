import React, { useEffect, useRef, useState } from 'react';
import {
  Rocket, Target, BarChart, HeartHandshake,
  ShieldCheck, TrendingUp, Zap, PieChart
} from 'lucide-react';
import logo from './assets/logo.png';
import imgHarsh    from './assets/Harsh Beniwal.jpg';
import imgElvish   from './assets/Elvish_Yadav.jpg';
import imgPrerana  from './assets/Prerana Das.jpg';
import imgPurav    from './assets/Purav Jha.avif';
import imgRahul    from './assets/Rahul Dey.jpg';
import imgSaikat   from './assets/Saikat Dey.jpg';
import imgThugesh  from './assets/Thugesh.jpg';
import imgBongGuy  from './assets/Your Bong Guy.jpg';

// Brand logos
import brandAngelOne  from './assets/logo/Angel_One_Logo.svg.png';
import brandDuolingo  from './assets/logo/Duolingo_logo.svg.png';
import brandFlipkart  from './assets/logo/Flipkart_logo_(2026).svg';
import brandMamaearth from './assets/logo/Mamaearth-Logo-Vector.svg-.png';
import brandNykaa     from './assets/logo/Nykaa_New_Logo.svg';
import brandSlice     from './assets/logo/Slice_Small_Finance_Bank.png';
import brandHimalaya  from './assets/logo/The_Himalaya_Drug_Company_logo.svg.png';
import brandImages    from './assets/logo/images.png';
import brandJar       from './assets/logo/jar-app-logo-png_seeklogo-543025.png';
import brandPocket    from './assets/logo/pocketoption.svg';

const tickerItems = [
  'Social Media Marketing',
  'IT Startup Growth',
  'Influencer Campaigns',
  'Brand Awareness',
  'Performance Ads',
  'Content Strategy',
  'Community Management',
  'ROI Optimisation',
];

const stats = [
  { num: '1L+',   label: 'Influencers' },
  { num: '1000+', label: 'Sign-ups in a day' },
  { num: '2',     label: 'Years in market' },
  { num: '57+',   label: 'Projects completed' },
];

const features = [
  { title: 'Proven Track Record',    desc: '57+ successful campaigns across IT verticals.' },
  { title: 'IT-Sector Expertise',    desc: 'We speak the language of founders and tech teams.' },
  { title: '1L+ Influencer Network', desc: 'Ready-to-activate creators in your niche.' },
  { title: 'Data-Driven Growth',     desc: 'Every decision backed by numbers, not guesswork.' },
];

const services = [
  { icon: <Rocket size={18}/>,         title: 'Product Launch',           desc: 'Create buzz and drive initial sales through targeted, high-impact campaigns.' },
  { icon: <Target size={18}/>,         title: 'Brand Awareness',          desc: 'Get your name in front of the right audience at the right moment.' },
  { icon: <PieChart size={18}/>,       title: 'Market Expansion',         desc: 'Enter new demographics with campaigns built to convert.' },
  { icon: <HeartHandshake size={18}/>, title: 'Engagement and Community', desc: 'Turn followers into loyal advocates with genuine interaction.' },
  { icon: <ShieldCheck size={18}/>,    title: 'Reputation Management',    desc: "Shape perception and protect your brand's digital image." },
  { icon: <TrendingUp size={18}/>,     title: 'Sales and Conversions',    desc: 'Funnel-optimised ads that turn clicks into customers.' },
  { icon: <Zap size={18}/>,            title: 'Competitive Intelligence', desc: 'Stay ahead by acting on live market and competitor insights.' },
  { icon: <BarChart size={18}/>,       title: 'ROI Maximisation',         desc: 'Continuous optimisation ensuring every rupee earns its keep.' },
];

const clients = [
  { name: 'Harsh Beniwal',  img: imgHarsh,   followers: '8M+',  platform: 'YouTube'   },
  { name: 'Elvish Yadav',   img: imgElvish,  followers: '20M+', platform: 'YouTube'   },
  { name: 'Prerana Das',    img: imgPrerana, followers: '2M+',  platform: 'Instagram' },
  { name: 'Purav Jha',      img: imgPurav,   followers: '5M+',  platform: 'YouTube'   },
  { name: 'Rahul Dey',      img: imgRahul,   followers: '1M+',  platform: 'Instagram' },
  { name: 'Saikat Dey',     img: imgSaikat,  followers: '1M+',  platform: 'YouTube'   },
  { name: 'Thugesh',        img: imgThugesh, followers: '3M+',  platform: 'YouTube'   },
  { name: 'Your Bong Guy',  img: imgBongGuy, followers: '2M+',  platform: 'YouTube'   },
];
const brands = [
  { name: 'Angel One',  img: brandAngelOne  },
  { name: 'Duolingo',   img: brandDuolingo  },
  { name: 'Flipkart',   img: brandFlipkart  },
  { name: 'Mamaearth',  img: brandMamaearth },
  { name: 'Nykaa',      img: brandNykaa     },
  { name: 'Slice Bank', img: brandSlice     },
  { name: 'Himalaya',   img: brandHimalaya  },
  { name: 'Jar App',    img: brandJar       },
  { name: 'Pocket Option', img: brandPocket },
  { name: 'D2C Brand',  img: brandImages    },
];

export default function App() {
  const navRef = useRef(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, service, message } = formData;

    const text =
      `*New Enquiry — Grow Wave Media*%0A%0A` +
      `*Name:* ${name}%0A` +
      `*Email:* ${email}%0A` +
      `*Phone:* ${phone || 'Not provided'}%0A` +
      `*Service:* ${service || 'Not specified'}%0A%0A` +
      `*Message:*%0A${message}`;

    window.open(`https://wa.me/917063363898?text=${text}`, '_blank');
    setStatus('success');
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
  };

  useEffect(() => {
    // Scroll reveal
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const allTicker = [...tickerItems, ...tickerItems];

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" ref={navRef} id="top">
        <div className="container nav-inner">
          <img src={logo} alt="Grow Wave Media" className="nav-logo" />
          <div className="nav-links">
            <a href="#about"    className="nav-link">About</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#contact"  className="nav-link">Contact</a>
          </div>
          <a href="#contact" className="nav-cta">
            Book a free call
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid-overlay" />

        {/* Ticker */}
        <div className="ticker">
          <div className="ticker-track">
            {allTicker.map((item, i) => (
              <div className="ticker-item" key={i}>
                <span className="dot" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-top container">
          <div className="hero-left">
            <div className="eyebrow">Digital Marketing Agency</div>
            <h1 className="hero-h1 hero-animate">
              We Scale{' '}
              <span className="outline-word">IT Startups</span>
              <br />
              <span className="accent-word">Worldwide.</span>
            </h1>
          </div>
          <div className="hero-meta hero-animate" style={{ animationDelay: '0.2s' }}>
            <p className="hero-desc">
              Grow Wave Media combines creativity with hard data to help tech founders
              build audiences, generate leads, and dominate their markets fast.
            </p>
            <div className="hero-actions">
              <a href="#contact"  className="btn-solid">Book consultation</a>
              <a href="#services" className="btn-line">See our services</a>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="hero-stats container">
          {stats.map((s, i) => (
            <div className="hstat" key={i}>
              <span className="hstat-num">{s.num}</span>
              <span className="hstat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BRAND MARQUEE */}
      <div className="brand-strip">
        <div className="brand-marquee">
          {[...brands, ...brands].map((b, i) => (
            <div className="brand-logo-item" key={i}>
              <img src={b.img} alt={b.name} className="brand-logo-img" />
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="about">
        <div className="about-grid container">
          <div className="about-left reveal">
            <div className="eyebrow">What we do</div>
            <h2>Where Creative Meets Calculated.</h2>
            <p>
              At Grow Wave Media, we specialise in social media marketing built
              specifically for IT startups. From first post to viral campaign,
              we architect your entire digital presence with one goal: growth.
            </p>
            <p>
              Our playbooks blend sharp creative with live analytics, so every
              campaign we run is accountable to real business outcomes, not
              vanity metrics.
            </p>
            <a href="#contact" className="btn-solid" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Let us talk
            </a>
          </div>

          <div className="about-right reveal">
            <div className="label">Why choose us</div>
            <div className="feature-rows">
              {features.map((f, i) => (
                <div className="feature-row" key={i}>
                  <span className="frow-num">0{i + 1}</span>
                  <div className="frow-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="founder-row">
              <div className="f-circle">AN</div>
              <div className="f-info">
                <div className="name">Arghyadip Naskar</div>
                <div className="role">Founder, Grow Waves Media</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS / INFLUENCERS */}
      <section className="clients-section">
        <div className="container">
          <div className="clients-head reveal">
            <div className="eyebrow">Our Clients</div>
            <h2 className="clients-h2">Influencers We Have Worked With</h2>
            <p className="clients-sub">From mega creators to niche voices — our network delivers reach that converts.</p>
          </div>
          <div className="clients-grid">
            {clients.map((c, i) => (
              <div className="client-card reveal" key={i} style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="client-img-wrap">
                  <img src={c.img} alt={c.name} className="client-img" />
                </div>
                <div className="client-info">
                  <span className="client-name">{c.name}</span>
                  <span className="client-meta">{c.followers} &middot; {c.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="services">
        <div className="services-head container reveal">
          <h2>When you need us, we are ready.</h2>
          <p>Every stage of your startup growth has a playbook. Here is ours.</p>
        </div>
        <div className="container svc-list">
          {services.map((s, i) => (
            <div className="svc-row reveal" key={i} style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="svc-idx">0{i + 1}</span>
              <span className="svc-title">{s.title}</span>
              <span className="svc-desc">{s.desc}</span>
              <span className="svc-arrow">&#x2197;</span>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <div className="contact-grid container">
          <div className="contact-left reveal">
            <div className="eyebrow">Get in touch</div>
            <h2>Let us build your growth story.</h2>
            <p>
              Whether you are launching a product, scaling a startup, or rebranding
              — we are ready to listen. Fill out the form and we will get back within 24 hours.
            </p>
            <div className="contact-info">
              <div className="contact-info-item">
                <span className="ci-label">Email</span>
                <span>info@growwavemedia.com</span>
              </div>
              <div className="contact-info-item">
                <span className="ci-label">Founder</span>
                <span>Arghyadip Naskar</span>
              </div>
              <div className="contact-info-item">
                <span className="ci-label">Response</span>
                <span>Within 24 hours</span>
              </div>
            </div>
          </div>

          <div className="contact-right reveal" style={{ transitionDelay: '0.1s' }}>
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name" name="name" type="text"
                    placeholder="Arghyadip Naskar"
                    value={formData.name} onChange={handleChange} required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email" name="email" type="email"
                    placeholder="you@company.com"
                    value={formData.email} onChange={handleChange} required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone" name="phone" type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone} onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="service">Service Interested In</label>
                  <select id="service" name="service" value={formData.service} onChange={handleChange}>
                    <option value="">Select a service...</option>
                    <option>Product Launch</option>
                    <option>Brand Awareness</option>
                    <option>Market Expansion</option>
                    <option>Influencer Campaigns</option>
                    <option>Performance Ads</option>
                    <option>ROI Maximisation</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message" name="message" rows={5}
                  placeholder="Tell us about your startup and goals..."
                  value={formData.message} onChange={handleChange} required
                />
              </div>
              <div className="form-submit">
                <button
                  type="submit"
                  className="btn-solid"
                  style={{ gap: '0.5rem', display: 'inline-flex', alignItems: 'center' }}
                >
                  <span>💬</span> Send on WhatsApp
                </button>
              </div>
              {status === 'success' && (
                <div className="form-status success">
                  ✅ WhatsApp is opening with your message — just hit Send!
                </div>
              )}
              {status === 'error' && (
                <div className="form-status error">
                  Something went wrong. Please email us directly at info@growwavemedia.com
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal">
        <h2>Does your startup fit any of these?</h2>
        <a href="mailto:info@growwavemedia.com" className="btn-black">Start a conversation</a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top container">
          <div>
            <img src={logo} alt="Grow Wave Media" className="footer-logo" />
            <p className="footer-about">
              A digital marketing agency dedicated to scaling IT startups through
              precision social media strategy, creative content, and measurable growth.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '1.5rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#4AFF91',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#0a0a0a', fontSize: '.85rem', flexShrink: 0
              }}>AN</div>
              <div>
                <div style={{ color: 'rgba(255,255,255,.7)', fontWeight: 700, fontSize: '.88rem' }}>Arghyadip Naskar</div>
                <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '.78rem' }}>Founder</div>
              </div>
            </div>
          </div>

          <div>
            <h4>Navigation</h4>
            <ul className="footer-list">
              <li><a href="#top">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4>Get In Touch</h4>
            <ul className="footer-list">
              <li><span>info@growwavemedia.com</span></li>
              <li><span>Book a Free Meeting</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom container">
          <span>&#169; {new Date().getFullYear()} Grow Wave Media. All rights reserved.</span>
          <span>Built for IT Startups. Built to grow.</span>
        </div>
      </footer>
    </>
  );
}
