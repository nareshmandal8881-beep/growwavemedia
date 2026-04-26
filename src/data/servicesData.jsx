import React from 'react';
import { FaFacebook } from 'react-icons/fa';
import { 
  Users, Share2, Search, 
  Video, Camera, Palette,
  Code, Smartphone, Globe
} from 'lucide-react';

import grafixImg1 from '../assets/1000817479.jpg.jpeg';
import grafixImg2 from '../assets/1000817480.jpg.jpeg';
import grafixImg3 from '../assets/1000817481.jpg.jpeg';

export const servicesData = {
  'influencer-marketing': {
    title: 'Influencer Marketing',
    icon: <Users size={40} />,
    tagline: 'Connect with the right voice for your brand.',
    description: 'We help IT startups and digital brands reach their target audience by strategically partnering with the most relevant creators. With a network of 1L+ influencers, we ensure your message resonates.',
    benefits: [
      'Access to 1L+ Influencers',
      'End-to-end Campaign Management',
      'Performance Tracking & ROI Analysis',
      'Niche Creator Targeting'
    ]
  },
  'social-media-management': {
    title: 'Social Media Management',
    icon: <Share2 size={40} />,
    tagline: 'Your brand, active and engaging.',
    description: 'Building a community is key to long-term growth. We handle everything from content scheduling and community engagement to strategy and analytics across all major platforms.',
    benefits: [
      'Platform-specific Strategy',
      'Community Engagement',
      'Content Calendar Planning',
      'Monthly Growth Reports'
    ]
  },
  'meta-ads': {
    title: 'Meta Ads',
    icon: <FaFacebook size={40} />,
    tagline: 'High-performance Facebook & Instagram Ads.',
    description: 'Scale your user acquisition with data-driven paid social campaigns. We optimize for conversions, not just clicks, ensuring your ad spend delivers real business results.',
    benefits: [
      'Advanced Audience Targeting',
      'A/B Creative Testing',
      'Retargeting Funnels',
      'Pixel & API Integration'
    ]
  },
  'google-ads': {
    title: 'Google Ads',
    icon: <Search size={40} />,
    tagline: 'Dominate search results and drive intent.',
    description: 'Appear where your customers are searching. Our Google Ads experts manage Search, Display, and YouTube campaigns that capture high-intent leads for your tech business.',
    benefits: [
      'Keyword Research & Optimization',
      'Display Network Reach',
      'YouTube Video Advertising',
      'Conversion Rate Optimization'
    ]
  },
  'video-editing': {
    title: 'Video Editing Service',
    icon: <Video size={40} />,
    tagline: 'Premium editing for high-impact content.',
    description: 'From YouTube videos to short-form reels, our editing team produces cinematic, high-retention content that keeps your audience hooked from start to finish.',
    benefits: [
      'Cinematic Color Grading',
      'Dynamic Motion Graphics',
      'Sound Design & Mixing',
      'Fast Turnaround Time'
    ],
    videos: [
      { type: 'long',  label: 'Long Form',  embedId: '2EOWRUU1928' },
      { type: 'long',  label: 'Long Form',  embedId: 'BGGLTYNP-k0' },
      { type: 'short', label: 'Short Form', embedId: '8M8E3AUNYZs' },
      { type: 'short', label: 'Short Form', embedId: '23b_eOf7FLY' },
    ]
  },
  'ugc-videos': {
    title: 'UGC Videos',
    icon: <Camera size={40} />,
    tagline: 'Authentic content from real people.',
    description: 'User-Generated Content is the most trusted form of marketing today. We facilitate the creation of authentic testimonials and demo videos that build instant trust.',
    benefits: [
      'Vetted UGC Creators',
      'Scripting & Directing',
      'Raw & Edited Content Options',
      'High Engagement Rates'
    ],
    videos: [
      { type: 'short', label: 'Short Form', embedId: 'WVQYsI9pe5k' },
    ]
  },
  'grafix-design': {
    title: 'Grafix Design',
    icon: <Palette size={40} />,
    tagline: 'Visual identities that stand out.',
    description: 'Brand identity, social media assets, and marketing collateral designed to communicate your brand value effectively and beautifully.',
    benefits: [
      'Logo & Brand Identity',
      'Social Media Graphics',
      'Landing Page Design',
      'Print & Digital Assets'
    ],
    images: [
      { src: grafixImg1, alt: 'Grafix Design Work 1' },
      { src: grafixImg2, alt: 'Grafix Design Work 2' },
      { src: grafixImg3, alt: 'Grafix Design Work 3' },
    ]
  },
  'website-development': {
    title: 'Website Development',
    icon: <Code size={40} />,
    tagline: 'Modern, scalable web & mobile solutions.',
    head: 'Naresh Mandal',
    description: 'Our development wing builds high-performance digital products for the modern web. From landing pages to complex cross-platform apps, we deliver excellence.',
    technologies: [
      { name: 'React', icon: <Code size={20} /> },
      { name: 'Wordpress', icon: <Globe size={20} /> },
      { name: 'Flutter', icon: <Smartphone size={20} /> }
    ],
    benefits: [
      'Custom React Development',
      'Scalable WordPress Solutions',
      'Cross-platform Flutter Apps',
      'Performance Optimized Code'
    ]
  }
};
