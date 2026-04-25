import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Play, CheckCircle2, ChevronRight,
  TrendingUp, Users, Target, Zap, Rocket,
  Search, Layers, Globe
} from 'lucide-react';
import { FaYoutube, FaLinkedin, FaFacebook } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import logo from './assets/logo.png';
import imgHarshGu  from './assets/Harsh Gujral.webp';
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
  'Influencer Marketing',
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
  { num: '100+',  label: 'Projects completed' },
];

const features = [
  { title: 'Proven Track Record',    desc: '100+ successful campaigns across IT verticals.' },
  { title: 'IT-Sector Expertise',    desc: 'We speak the language of founders and tech teams.' },
  { title: '1L+ Influencer Network', desc: 'Ready-to-activate creators in your niche.' },
  { title: 'Data-Driven Growth',     desc: 'Every decision backed by numbers, not guesswork.' },
];

const services = [
  { icon: <Search size={22}/>,     title: 'Google Search Advertising', desc: 'Text ads on Google Search, that are displayed when a user types in a specific keyword, related to your product' },
  { icon: <Layers size={22}/>,     title: 'Display Advertising',       desc: 'Visual ads, that are displayed on millions of websites and mobile apps, which are part of Google Display Network' },
  { icon: <FaFacebook size={22}/>, title: 'Facebook Advertising',      desc: 'Different ad formats, that are displayed on Facebook to targeted demographics and interests.' },
  { icon: <Globe size={22}/>,      title: 'Website Development',       desc: 'Beautiful websites with high conversion rates built to engage your specific target audience.' },
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

const Counter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const numMatch = value.match(/\d+/);
    if (!numMatch) {
      setCount(value);
      return;
    }
    const target = parseInt(numMatch[0]);
    const suffix = value.replace(numMatch[0], '');
    let start = 0;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target + suffix);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start) + suffix);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  return <span ref={ref}>{count || '0'}</span>;
};

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
      <Navbar />

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
              <span className="hstat-num">
                <Counter value={s.num} />
              </span>
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
            <div className="eyebrow">INFLUENCER MARKETING</div>
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
      <section id="services" className="services-section">
        <div className="svc-glow-orb" />
        <div className="container">
          <div className="services-head reveal">
            <h2>Services<span className="dot-accent">.</span></h2>
          </div>

          <div className="svc-grid">
            {services.map((s, i) => (
              <div className="svc-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="svc-card-header">
                  <div className="svc-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                </div>
                <p className="svc-card-desc">{s.desc}</p>
                <div className="svc-card-action">
                  <a href="#contact" className="btn-outline">Learn more</a>
                </div>
              </div>
            ))}
          </div>
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
                    <option>Influencer Marketing</option>
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
                  style={{ gap: '0.6rem', display: 'inline-flex', alignItems: 'center' }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg> Send on WhatsApp
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
      <Footer />
    </>
  );
}
