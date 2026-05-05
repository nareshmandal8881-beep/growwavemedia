import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { blogsData } from './data/blogsData';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import './blog.css'; // Import the new CSS

export default function BlogDetailPage() {
  const { slug } = useParams();
  const blog = blogsData.find(b => b.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!blog) {
    return <Navigate to="/blog" replace />;
  }

  // Get 3 related posts (excluding current one)
  const relatedPosts = blogsData.filter(b => b.id !== blog.id).slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="blog-page">
      <Helmet>
        <title>{blog.title} | Grow Wave Media</title>
        <meta name="description" content={blog.excerpt} />
        {/* Open Graph Tags for Social Sharing */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.image} />
        <meta property="og:type" content="article" />
      </Helmet>

      <Navbar />

      <main className="blog-detail-main">
        {/* Article Header */}
        <article className="blog-article">
          <Link to="/blog" className="blog-back-btn">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="blog-meta">
            <span className="blog-meta-category">
              {blog.category}
            </span>
            <span className="blog-meta-date">
              <Calendar size={14} /> {blog.date}
            </span>
          </div>

          <h1 className="blog-title">
            {blog.title}
          </h1>

          <div className="blog-author-row">
            <div className="blog-author">
              <User size={18} />
              <span>By {blog.author}</span>
            </div>
            <button onClick={handleShare} className="blog-share-btn" title="Share Article">
              <Share2 size={18} />
            </button>
          </div>

          {/* Featured Image */}
          <div className="blog-hero-image">
            <img src={blog.image} alt={blog.title} />
          </div>

          {/* Article Content */}
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Related Posts */}
        <div className="blog-related container">
          <h3>Related Articles</h3>
          <div className="blog-grid">
            {relatedPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </div>
                <div className="blog-card-content">
                  <span className="blog-card-category">{post.category}</span>
                  <h4 className="blog-card-title">{post.title}</h4>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
