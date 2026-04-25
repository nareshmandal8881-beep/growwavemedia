import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, TrendingUp, Star, Calendar, Globe } from 'lucide-react';
import { FaYoutube, FaLinkedin, FaFacebook } from 'react-icons/fa';
import logo from './assets/logo.png';
import spyImg from '/SPY06731.jpg.jpeg';
import deepImg from '/DEEP3037.jpg.jpeg';

const milestones = [
  { year: '2019', title: 'The Beginning', desc: 'Started the creator journey on YouTube — faced channel deletions but refused to give up.' },
  { year: '2021', title: 'Brand Deal Pivot', desc: 'Transitioned to brand partnerships where creative prowess led to exponential growth, surpassing platform monetization.' },
  { year: '2023', title: 'Network Builder', desc: 'Identified the market gap and began strategically connecting 50,000+ Indian creators with 100+ brands.' },
  { year: '2024', title: 'Grow Wave Media', desc: 'Formally launched Grow Wave Media — a full-service influencer marketing and digital agency.' },
];

const awards = [
  {
    img: spyImg,
    title: 'Banga Gourav Ratna Samman 2026',
    subtitle: 'Best Content Creator of the Year',
    color: '#38CFFF',
  },
  {
    img: deepImg,
    title: 'Bengal Business Excellence Award 2026',
    subtitle: 'Outstanding Entrepreneurial Achievement',
    color: '#818cf8',
  },
];

const stats = [
  { icon: <Users size={22} />, num: '50,000+', label: 'Creators Connected' },
  { icon: <Globe size={22} />, num: '100+', label: 'Brand Partnerships' },
  { icon: <TrendingUp size={22} />, num: '57+', label: 'Projects Completed' },
  { icon: <Calendar size={22} />, num: '2019', label: 'Journey Started' },
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

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" id="top">
        <div className="container nav-inner">
          <Link to="/">
            <img src={logo} alt="Grow Wave Media" className="nav-logo" />
          </Link>
          <div className="nav-links">
            <Link to="/#about" className="nav-link">About</Link>
            <Link to="/#services" className="nav-link">Services</Link>
            <Link to="/#contact" className="nav-link">Contact</Link>
          </div>
          <Link to="/#contact" className="nav-cta">Book a free call</Link>
        </div>
      </nav>

      {/* HERO BANNER */}
      <section className="about-hero">
        <div className="about-hero-grid-overlay" />
        <div className="container about-hero-inner">

          <div className="eyebrow" style={{ marginTop: '1.5rem' }}>Our Story</div>
          <h1 className="about-hero-h1">
            Meet the <span className="about-accent">Creator</span>
            <br />Behind the Agency.
          </h1>
          <p className="about-hero-desc">
            More than just an entrepreneur — Arghyadip Naskar is first and foremost a creator,
            a distinction that defines his dual commitment to both the creative community and brand partnerships.
          </p>
        </div>
        {/* Decorative orbs */}
        <div className="about-orb about-orb-1" />
        <div className="about-orb about-orb-2" />
      </section>

      {/* FOUNDER STORY */}
      <section className="about-story-section">
        <div className="container about-story-grid">
          <div className="about-story-left reveal">
            <div className="label">The Founder</div>
            <h2 className="about-story-h2">Arghyadip Naskar</h2>
            <p className="about-story-role">Founder &amp; CEO — Grow Wave Media</p>
            <div className="about-story-divider" />
            <p className="about-story-p">
              More than just an entrepreneur, Arghyadip Naskar is first and foremost a creator
              — a distinction that defines his dual commitment to both the creative community and brand partnerships.
            </p>
            <p className="about-story-p">
              His journey began in 2019 when he faced the deletion of multiple YouTube channels. Refusing to concede,
              he persevered, transitioning to brand deals where his creative prowess led to exponential growth,
              surpassing even platform monetization.
            </p>
            <p className="about-story-p">
              This unwavering passion-driven focus extended to his lifestyle, culminating in leaving a stable
              government post to dedicate himself entirely to his ventures.
            </p>
            <p className="about-story-p">
              Identifying a market gap, he strategically connected creators with brands, fostering a network that
              has connected over <strong>50,000 Indian creators</strong> with more than <strong>100 brands</strong> —
              and led to the formal launch of <strong>Grow Wave Media in 2024</strong>.
            </p>
            <p className="about-story-p">
              Driven by his passion for business, he continues to lead the agency's strategic advancement,
              demonstrating how influencers and brands can collaboratively achieve growth.
            </p>
          </div>

          <div className="about-story-right reveal" style={{ transitionDelay: '0.15s' }}>
            {/* Stats */}
            <div className="about-stats-grid">
              {stats.map((s, i) => (
                <div className="about-stat-card" key={i}>
                  <div className="about-stat-icon">{s.icon}</div>
                  <div className="about-stat-num">
                    <Counter value={s.num} />
                  </div>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="about-quote-box">
              <div className="about-quote-mark">"</div>
              <p className="about-quote-text">
                Every creator deserves a fair shot at brand partnerships. Every brand deserves a real audience.
                My mission is to bridge that gap at scale.
              </p>
              <div className="about-quote-author">
                <div className="f-circle" style={{ width: 40, height: 40, fontSize: '0.8rem' }}>AN</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Arghyadip Naskar</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Founder, Grow Wave Media</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY TIMELINE */}
      <section className="about-timeline-section">
        <div className="container">
          <div className="about-section-head reveal">
            <div className="eyebrow" style={{ color: 'var(--ink)', background: 'rgba(74,255,145,0.12)', borderColor: 'rgba(74,255,145,0.3)' }}>
              The Journey
            </div>
            <h2 className="about-timeline-h2">From Creator to Agency Founder</h2>
          </div>
          <div className="about-timeline">
            {milestones.map((m, i) => (
              <div className="about-timeline-item reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="about-timeline-year">{m.year}</div>
                <div className="about-timeline-connector">
                  <div className="about-timeline-dot" />
                  {i < milestones.length - 1 && <div className="about-timeline-line" />}
                </div>
                <div className="about-timeline-content">
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AWARDS & RECOGNITION */}
      <section className="about-awards-section">
        <div className="container">
          <div className="about-section-head reveal">
            <div className="eyebrow">Recognition</div>
            <h2 className="about-awards-h2">Awards &amp; Honours</h2>
            <p className="about-awards-sub">
              Arghyadip's influence has earned him distinguished recognition across the industry.
            </p>
          </div>

          <div className="about-awards-grid">
            {awards.map((a, i) => (
              <div className="about-award-card reveal" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="about-award-img-wrap">
                  <img src={a.img} alt={a.title} className="about-award-img" />
                  <div className="about-award-overlay">
                    <Award size={32} color={a.color} />
                  </div>
                </div>
                <div className="about-award-body">
                  <div className="about-award-badge" style={{ color: a.color, borderColor: `${a.color}30`, background: `${a.color}10` }}>
                    <Star size={12} fill={a.color} /> Award 2026
                  </div>
                  <h3 className="about-award-title">{a.title}</h3>
                  <p className="about-award-subtitle">{a.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Third award text-only */}
          <div className="about-award-text-card reveal">
            <div className="about-award-text-icon">
              <Award size={28} color="#F72585" />
            </div>
            <div>
              <div className="about-award-badge" style={{ color: '#F72585', borderColor: '#F7258530', background: '#F7258510', marginBottom: '0.5rem' }}>
                <Star size={12} fill="#F72585" /> Award 2026
              </div>
              <h3 className="about-award-text-title">Basanta Samman Award 2026</h3>
              <p className="about-award-text-desc">Awarded for outstanding contributions to the creator economy and digital entrepreneurship in West Bengal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="container about-cta-inner reveal">
          <div className="eyebrow">Work With Us</div>
          <h2 className="about-cta-h2">Ready to Grow Your Brand?</h2>
          <p className="about-cta-desc">
            Join hundreds of brands and thousands of creators on the Grow Wave Media network.
          </p>
          <div className="about-cta-actions">
            <Link to="/#contact" className="btn-solid">Book a Free Consultation</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top container">
          <div>
            <img src={logo} alt="Grow Wave Media" className="footer-logo" />
            <p className="footer-about">Digital Marketing Agency for IT Startups</p>
            <div className="footer-address">Grow Wave Media<br />New Delhi, India</div>
          </div>
          <div>
            <h4>Contact us</h4>
            <ul className="footer-list">
              <li><a href="mailto:growwavemedia@gmail.com">growwavemedia@gmail.com</a></li>
              <li><a href="tel:+917063363898">+91 70633 63898</a></li>
            </ul>
            <div className="footer-socials">
              <a href="#" aria-label="YouTube"><FaYoutube size={16} /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedin size={16} /></a>
              <a href="#" aria-label="Facebook"><FaFacebook size={16} /></a>
            </div>
          </div>
          <div>
            <h4>Navigation</h4>
            <ul className="footer-list">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/#services">Services</Link></li>
              <li><Link to="/#contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul className="footer-list">
              <li><Link to="/#services">Google Search Advertising</Link></li>
              <li><Link to="/#services">Display Advertising</Link></li>
              <li><Link to="/#services">Facebook Advertising</Link></li>
              <li><Link to="/#services">Website Development</Link></li>
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
