import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { blogsData } from './data/blogsData';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-ink min-h-screen font-outfit text-white selection:bg-accent selection:text-ink">
      <Helmet>
        <title>Blog - Influencer Marketing & Brand Growth | Grow Wave Media</title>
        <meta name="description" content="Read the latest insights, strategies, and guides on influencer marketing, content creation, and brand growth from Grow Wave Media." />
      </Helmet>

      <Navbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none text-glow">
            Our <span className="text-accent italic">Blog</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Expert insights, strategies, and industry news to help brands scale and creators thrive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsData.map((blog) => (
            <Link to={`/blog/${blog.slug}`} key={blog.id} className="group relative block overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all duration-300 hover:-translate-y-2">
              <div className="aspect-[16/9] overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs font-bold text-accent uppercase tracking-wider mb-3">
                  <span>{blog.category}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {blog.title}
                </h2>
                <p className="text-white/60 mb-6 line-clamp-3 text-sm leading-relaxed">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-white/40 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
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
