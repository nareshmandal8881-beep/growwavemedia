import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { blogsData } from './data/blogsData';
import { Calendar, ArrowRight } from 'lucide-react';
import './blog.css'; // Import the new CSS

export default function BlogPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="blog-page">
      <Helmet>
        <title>Blog - Influencer Marketing & Brand Growth | Grow Wave Media</title>
        <meta name="description" content="Read the latest insights, strategies, and guides on influencer marketing, content creation, and brand growth from Grow Wave Media." />
      </Helmet>

      <Navbar />

      <main className="blog-main container">
        <div className="blog-header">
          <h1>
            Our <span>Blog</span>
          </h1>
          <p>
            Expert insights, strategies, and industry news to help brands scale and creators thrive.
          </p>
        </div>

        <div className="blog-grid">
          {blogsData.map((blog) => (
            <Link to={`/blog/${blog.slug}`} key={blog.id} className="blog-card">
              <div className="blog-card-image">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  loading="lazy"
                />
              </div>
              <div className="blog-card-content">
                <div className="blog-card-category">
                  {blog.category}
                </div>
                <h2 className="blog-card-title">
                  {blog.title}
                </h2>
                <p className="blog-card-excerpt">
                  {blog.excerpt}
                </p>
                <div className="blog-card-footer">
                  <div className="blog-card-date">
                    <Calendar size={14} />
                    <span>{blog.date}</span>
                  </div>
                  <div className="blog-card-readmore">
                    Read Article <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
