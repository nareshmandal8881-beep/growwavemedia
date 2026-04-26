import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { servicesData } from './data/servicesData';

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = servicesData[serviceId];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  if (!service) {
    return (
      <div className="service-not-found">
        <Navbar />
        <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
          <h2>Service not found</h2>
          <Link to="/" className="btn-solid" style={{ marginTop: '2rem' }}>Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="service-page">
      <Navbar />

      {/* Hero */}
      <section className="service-hero">
        <div className="container">
          <Link to="/" className="btn-back">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="service-hero-content reveal in">
            <div className="service-hero-icon">{service.icon}</div>
            <h1 className="service-title">{service.title}</h1>
            <p className="service-tagline">{service.tagline}</p>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="service-details">
        <div className="container service-grid">
          <div className="service-main-content reveal in">
            <h2>Overview</h2>
            <p className="service-description">{service.description}</p>
            
            {service.head && (
              <div className="service-head-card">
                <div className="label">Head of Department</div>
                <h3>{service.head}</h3>
              </div>
            )}

            {service.technologies && (
              <div className="service-tech-stack">
                <h3>Core Technologies</h3>
                <div className="tech-grid">
                  {service.technologies.map((tech, i) => (
                    <div key={i} className="tech-item">
                      {tech.icon}
                      <span>{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="service-sidebar reveal in">
            <div className="benefits-card">
              <h3>Key Benefits</h3>
              <ul className="benefits-list">
                {service.benefits.map((benefit, i) => (
                  <li key={i}>
                    <CheckCircle2 size={18} color="var(--accent)" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/#contact" className="btn-solid block-btn">
                Book a Consultation <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
