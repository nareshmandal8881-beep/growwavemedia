import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { blogsData } from './data/blogsData';
import { Calendar, User, ArrowLeft, Share2, Clock, Tag, ChevronRight } from 'lucide-react';
import './blog.css';

function estimateReadTime(content) {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const blog = blogsData.find(b => b.slug === slug);
  const [copied, setCopied] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!blog) return <Navigate to="/blog" replace />;

  const relatedPosts = blogsData.filter(b => b.id !== blog.id).slice(0, 3);
  const readTime = estimateReadTime(blog.content);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog.title, text: blog.excerpt, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="blog-page">
      <Helmet>
        <title>{blog.title} | Grow Wave Media</title>
        <meta name="description" content={blog.excerpt} />
        <meta name="keywords" content={`influencer marketing, ${blog.category}, grow wave media, brand deals, content creators, digital marketing india`} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.image} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={blog.author} />
        <link rel="canonical" href={`https://growwavemedia.com/blog/${blog.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": blog.title,
          "description": blog.excerpt,
          "image": blog.image,
          "author": { "@type": "Person", "name": blog.author },
          "publisher": { "@type": "Organization", "name": "Grow Wave Media" },
          "datePublished": blog.date,
        })}</script>
      </Helmet>

      <Navbar />

      <main className="blog-detail-main">
        <div className="blog-detail-container">

          {/* ── Main Column ── */}
          <article className="blog-article-wide">
            <Link to="/blog" className="blog-back-btn">
              <ArrowLeft size={16} /> Back to Blog
            </Link>

            <div className="blog-meta">
              <span className="blog-meta-category">{blog.category}</span>
              <span className="blog-meta-date"><Calendar size={14} /> {blog.date}</span>
              <span className="blog-meta-date"><Clock size={14} /> {readTime} min read</span>
            </div>

            <h1 className="blog-title">{blog.title}</h1>

            <div className="blog-author-row">
              <div className="blog-author"><User size={18} /><span>By {blog.author}</span></div>
              <button onClick={handleShare} className="blog-share-btn" title="Share Article">
                <Share2 size={18} />
                <span style={{ fontSize: '0.8rem', marginLeft: '0.25rem' }}>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            <div className="blog-hero-image">
              <img src={blog.image} alt={blog.title} />
            </div>

            <div className="blog-excerpt-callout">
              <p>{blog.excerpt}</p>
            </div>

            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

            <div className="blog-cta-banner">
              <div className="blog-cta-banner__text">
                <h3>Ready to grow with the right creators?</h3>
                <p>Grow Wave Media connects brands with authentic influencers who deliver real ROI.</p>
              </div>
              <Link to="/#contact" className="blog-cta-banner__btn">Get Started →</Link>
            </div>

            <div className="blog-tags">
              <Tag size={14} />
              {['Influencer Marketing', blog.category, 'Digital Marketing India', 'Brand Growth'].map(tag => (
                <span key={tag} className="blog-tag">{tag}</span>
              ))}
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="blog-sidebar">
            <div className="blog-sidebar-card">
              <div className="blog-sidebar-card__avatar">{blog.author.charAt(0).toUpperCase()}</div>
              <h4 className="blog-sidebar-card__name">{blog.author}</h4>
              <p className="blog-sidebar-card__desc">Expert at Grow Wave Media — India's leading influencer marketing agency.</p>
            </div>

            <div className="blog-sidebar-section">
              <h4 className="blog-sidebar-section__title">Related Articles</h4>
              <div className="blog-sidebar-posts">
                {relatedPosts.map(post => (
                  <Link to={`/blog/${post.slug}`} key={post.id} className="blog-sidebar-post">
                    <img src={post.image} alt={post.title} className="blog-sidebar-post__img" loading="lazy" />
                    <div>
                      <span className="blog-sidebar-post__cat">{post.category}</span>
                      <p className="blog-sidebar-post__title">{post.title}</p>
                    </div>
                    <ChevronRight size={14} className="blog-sidebar-post__arrow" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="blog-sidebar-newsletter">
              <h4>Get Marketing Insights</h4>
              <p>Weekly tips on influencer marketing & brand growth in India.</p>
              <input type="email" placeholder="Your email address" />
              <button>Subscribe Free →</button>
            </div>
          </aside>

        </div>

        {/* Bottom related grid */}
        <div className="blog-related-bottom">
          <h3>More Articles You'll Love</h3>
          <div className="blog-grid blog-grid--wide">
            {relatedPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </div>
                <div className="blog-card-content">
                  <span className="blog-card-category">{post.category}</span>
                  <h4 className="blog-card-title">{post.title}</h4>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-footer">
                    <span className="blog-card-date"><Calendar size={12} /> {post.date}</span>
                    <span className="blog-card-readmore">Read More →</span>
                  </div>
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
