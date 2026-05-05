import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { blogsData } from './data/blogsData';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';

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
    <div className="bg-ink min-h-screen font-outfit text-white selection:bg-accent selection:text-ink">
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

      <main className="pt-32 pb-24">
        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-accent font-bold text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="mb-6 flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
              {blog.category}
            </span>
            <span className="text-white/40 text-sm font-semibold flex items-center gap-1.5">
              <Calendar size={14} /> {blog.date}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-8">
            <div className="flex items-center gap-2 text-white/60 font-semibold">
              <User size={18} className="text-accent" />
              <span>By {blog.author}</span>
            </div>
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-accent hover:text-ink transition-colors" title="Share Article">
              <Share2 size={18} />
            </button>
          </div>

          {/* Featured Image */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 border border-white/10">
            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-accent hover:prose-a:text-white prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Related Posts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-white/10">
          <h3 className="text-2xl font-black mb-8">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.id} className="group relative block overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2 block">{post.category}</span>
                  <h4 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-accent transition-colors">{post.title}</h4>
                  <p className="text-white/60 text-sm line-clamp-2">{post.excerpt}</p>
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
