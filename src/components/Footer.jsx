import React from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top container">
        {/* Column 1 */}
        <div className="footer-col">
          <img src={logo} alt="Grow Wave Media" className="footer-logo" />
          <p className="footer-about">
            Digital Marketing Agency for IT Startups
          </p>
          <div className="footer-address">
            Grow Wave Media<br />
            Kolkata, India
          </div>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h4>Contact us</h4>
          <ul className="footer-list">
            <li><a href="mailto:info@growwavemedia.com">info@growwavemedia.com</a></li>
            <li><a href="tel:+917063363898">+91 70633 63898</a></li>
          </ul>
          <div className="footer-socials">
            <a href="https://www.instagram.com/grow_wave_media?igsh=MTdxMWhibTNlemc0ZQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram size={16} /></a>
            <a href="#" aria-label="YouTube"><FaYoutube size={16} /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin size={16} /></a>
            <a href="#" aria-label="Facebook"><FaFacebook size={16} /></a>
          </div>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h4>Navigation</h4>
          <ul className="footer-list">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><a href="/#contact">Contacts</a></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="footer-col">
          <h4>Services</h4>
          <ul className="footer-list">
            <li><a href="/#services">Google Search Advertising</a></li>
            <li><a href="/#services">Display Advertising</a></li>
            <li><a href="/#services">Facebook Advertising</a></li>
            <li><a href="/#services">Website Development</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom container">
        <span>&#169; {new Date().getFullYear()} Grow Wave Media. All rights reserved.</span>
        <span>Built for IT Startups. Built to grow.</span>
      </div>
    </footer>
  );
}
