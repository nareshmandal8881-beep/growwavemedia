import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar" id="top">
      <div className="container nav-inner">
        <Link to="/" onClick={() => setIsOpen(false)}>
          <img src={logo} alt="Grow Wave Media" className="nav-logo" />
        </Link>
        
        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <Link to="/about" className="nav-link">About Us</Link>
          <a href="/#services" className="nav-link">Services</a>
          <a href="/#contact" className="nav-link">Contact</a>
        </div>

        <div className="nav-actions">
          <a href="/#contact" className="nav-cta desktop-only">
            Book a free call
          </a>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-links">
          <Link to="/about" className="mobile-link" onClick={() => setIsOpen(false)}>About Us</Link>
          <a href="/#services" className="mobile-link" onClick={() => setIsOpen(false)}>Services</a>
          <a href="/#contact" className="mobile-link" onClick={() => setIsOpen(false)}>Contact</a>
          <a href="/#contact" className="mobile-cta" onClick={() => setIsOpen(false)}>
            Book a free call
          </a>
        </div>
      </div>
    </nav>
  );
}
